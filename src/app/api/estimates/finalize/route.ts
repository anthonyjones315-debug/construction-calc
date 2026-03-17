import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
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
import {
  buildSigningMeta,
  finalizeEstimateSchema,
  generateEstimateShareCode,
  withFinalizeInputs,
} from "@/lib/estimates/finalize";
import { isUnauthorizedError } from "@/lib/errors/unauthorized";
import { sendEstimateSignatureEmail } from "@/lib/email/estimates";
import { getPostHogClient } from "@/lib/posthog-server";
import { normalizeDollars } from "@/utils/money";

function getClientEmail(input: Record<string, unknown> | undefined) {
  const candidate = input?.client_email;
  return typeof candidate === "string" && candidate.includes("@")
    ? candidate.trim()
    : null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = finalizeEstimateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid estimate payload." },
      { status: 400 },
    );
  }

  try {
    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    const tenantId = getTenantScopeId(businessContext);
    const payload = parsed.data;
    const contractorProfileQuery = businessContext.usesLegacyUserScope
      ? db
          .from("business_profiles")
          .select("business_name, business_email")
          .eq("user_id", tenantId)
          .maybeSingle()
      : db
          .from("business_profiles")
          .select("business_name, business_email")
          .eq("business_id", tenantId)
          .maybeSingle();

    if (rawBody && typeof rawBody === "object") {
      assertNoBusinessIdOverride(
        (rawBody as Record<string, unknown>).business_id,
        businessContext,
      );
    }

    let shareCode = "";
    let signingMeta = buildSigningMeta(generateEstimateShareCode());
    let insertError: { code?: string; message: string } | null = null;
    let savedId: string | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      shareCode = signingMeta.shareCode;

      const insertPayload: Record<string, unknown> = {
        user_id: session.user.id,
        name: payload.name,
        calculator_id: payload.calculator_id,
        inputs: withFinalizeInputs(
          payload.inputs,
          payload,
          signingMeta,
          {
            user_id: session.user.id,
            user_email: session.user.email ?? null,
            user_name: session.user.name ?? null,
          },
        ),
        results: payload.results,
        budget_items: null,
        client_name: payload.client_name ?? null,
        job_site_address: payload.job_site_address ?? null,
        total_cost:
          payload.total_cost !== null && payload.total_cost !== undefined
            ? normalizeDollars(payload.total_cost)
            : null,
        status: "PENDING",
        share_code: shareCode,
      };

      if (!businessContext.usesLegacyUserScope) {
        insertPayload.business_id = businessContext.businessId;
      }

      const { data, error } = await db
        .from("saved_estimates")
        .insert(insertPayload)
        .select("id")
        .single();

      if (!error && data?.id) {
        savedId = data.id;
        insertError = null;
        break;
      }

      insertError = error;
      if (error?.code !== "23505") {
        break;
      }

      signingMeta = buildSigningMeta(generateEstimateShareCode());
    }

    if (!savedId) {
      throw new Error(insertError?.message ?? "Unable to finalize estimate.");
    }

    revalidateTag(FINANCIAL_DASHBOARD_TAG, "max");
    revalidateTag(getFinancialDashboardTag(tenantId), "max");
    revalidateTag(SAVED_ESTIMATES_TAG, "max");
    revalidateTag(getSavedEstimatesTag(tenantId), "max");
    revalidateTag(getEstimateTag(savedId), "max");

    const { data: contractorProfile, error: contractorProfileError } =
      await contractorProfileQuery;
    if (contractorProfileError) {
      throw new Error(contractorProfileError.message);
    }

    const clientEmail = getClientEmail(payload.inputs);
    if (clientEmail) {
      await sendEstimateSignatureEmail({
        to: clientEmail,
        clientName: payload.client_name ?? null,
        estimateName: payload.name,
        jobName: payload.metadata.jobName ?? payload.name,
        signUrl: signingMeta.signUrl,
        contractorName: contractorProfile?.business_name ?? session.user.name ?? null,
        replyTo:
          contractorProfile?.business_email ?? session.user.email ?? null,
      });
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: session.user.id,
      event: "estimate_finalized",
      properties: {
        estimate_id: savedId,
        calculator_id: payload.calculator_id,
        trade: payload.calculator_id.split("/")[1] ?? "unknown",
        primary_total:
          payload.total_cost !== null && payload.total_cost !== undefined
            ? normalizeDollars(payload.total_cost)
            : null,
        has_client: Boolean(payload.client_name),
        client_emailed: Boolean(clientEmail),
      },
    });
    await posthog.shutdown();

    return NextResponse.json({
      ok: true,
      id: savedId,
      shareCode,
      signUrl: signingMeta.signUrl,
      emailed: Boolean(clientEmail),
      status: "PENDING",
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    Sentry.captureException(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
