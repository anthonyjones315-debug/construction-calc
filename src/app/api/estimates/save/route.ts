import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  assertNoBusinessIdOverride,
  getBusinessContextForSession,
  getTenantScopeId,
} from "@/lib/supabase/business";
import {
  FINANCIAL_DASHBOARD_TAG,
  SAVED_ESTIMATES_TAG,
  getEstimateTag,
  getFinancialDashboardTag,
  getSavedEstimatesTag,
} from "@/lib/cache-tags";
import { isUnauthorizedError } from "@/lib/errors/unauthorized";
import { getPostHogClient } from "@/lib/posthog-server";
import { normalizeDollars } from "@/utils/money";

const saveEstimateSchema = z
  .object({
    name: z.string().trim().max(200).optional(),
    calculator_id: z.string().trim().max(100).optional(),
    results: z.array(z.unknown()).optional(),
    inputs: z.record(z.string(), z.unknown()).optional(),
    budget_items: z.array(z.unknown()).nullable().optional(),
    client_name: z.string().trim().max(200).nullable().optional(),
    job_site_address: z.string().trim().max(500).nullable().optional(),
    total_cost: z.number().finite().nullable().optional(),
    status: z.enum(["Draft", "Sent", "Approved", "Lost", "PENDING", "SIGNED"]).optional(),
  })
  .strict();

function newErrorId() {
  return crypto.randomUUID();
}

function getSchemaMismatchHint(message: string): string | null {
  const lower = message.toLowerCase();

  if (
    lower.includes("public.users") ||
    lower.includes("saved_estimates") ||
    lower.includes("foreign key")
  ) {
    return "Database schema mismatch detected. Run src/lib/supabase/nextauth-schema-fix.sql, then src/lib/supabase/schema.sql in Supabase SQL Editor.";
  }

  return null;
}

function normalizeControlNumber(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
  return normalized.length > 0 ? normalized : null;
}

function generateEstimateControlNumber(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(2, 12);
  const suffix = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();
  return `PC-${stamp}-${suffix}`;
}

export async function POST(req: NextRequest) {
  const requestId = newErrorId();
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = saveEstimateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid estimate payload." },
      { status: 400 },
    );
  }

  const body = parsed.data;
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "unknown";

  try {
    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    const tenantId = getTenantScopeId(businessContext);

    if (rawBody && typeof rawBody === "object") {
      assertNoBusinessIdOverride(
        (rawBody as Record<string, unknown>).business_id,
        businessContext,
      );
    }

    const inputObject = body.inputs ?? {};
    const existingControlNumber = normalizeControlNumber(
      inputObject.control_number,
    );
    const controlNumber =
      existingControlNumber ?? generateEstimateControlNumber();

    const ownerMeta = {
      user_id: session.user.id,
      user_email: session.user.email ?? null,
      user_name: session.user.name ?? null,
    };

    const insertPayload: Record<string, unknown> = {
      user_id: session.user.id,
      name: body.name || "Untitled Estimate",
      calculator_id: body.calculator_id || "unknown",
      inputs: {
        ...inputObject,
        control_number: controlNumber,
        owner: ownerMeta,
      },
      results: body.results ?? [],
      budget_items: body.budget_items ?? null,
      client_name: body.client_name ?? null,
      job_site_address: body.job_site_address ?? null,
      total_cost:
        body.total_cost !== null && body.total_cost !== undefined
          ? normalizeDollars(body.total_cost)
          : null,
      status: body.status ?? "Draft",
    };
    if (!businessContext.usesLegacyUserScope) {
      insertPayload.business_id = businessContext.businessId;
    }

    const { data, error } = await db
      .schema("public")
      .from("saved_estimates")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      const schemaHint = getSchemaMismatchHint(error.message);
      console.error("[save-estimate] insert failed", {
        requestId,
        userId: session.user.id,
        message: error.message,
      });
      Sentry.captureException(error, {
        tags: { route: "save-estimate" },
        extra: { requestId, userId: session.user.id, schemaHint },
      });
      return NextResponse.json(
        {
          error: schemaHint
            ? `${schemaHint} Raw error: ${error.message}. Project: ${projectUrl} (ref: ${requestId})`
            : `Save failed: ${error.message} (ref: ${requestId})`,
        },
        { status: 500 },
      );
    }

    revalidateTag(FINANCIAL_DASHBOARD_TAG, "max");
    revalidateTag(getFinancialDashboardTag(tenantId), "max");
    revalidateTag(SAVED_ESTIMATES_TAG, "max");
    revalidateTag(getSavedEstimatesTag(tenantId), "max");
    revalidateTag(getEstimateTag(data.id), "max");

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: session.user.id,
      event: "estimate_saved",
      properties: {
        estimate_id: data.id,
        calculator_id: body.calculator_id ?? "unknown",
        has_client: Boolean(body.client_name),
        status: body.status ?? "Draft",
      },
    });
    await posthog.shutdown();

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
