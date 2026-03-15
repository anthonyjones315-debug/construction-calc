import { NextRequest, NextResponse } from "next/server";
import { cacheTag, revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  assertNoBusinessIdOverride,
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import {
  throwForStaleCacheOnTimeout,
  withSupabaseRevalidationTimeout,
} from "@/lib/supabase/stale-cache";

async function getBusinessProfile(
  tenantColumn: "business_id" | "user_id",
  tenantId: string,
) {
  "use cache";
  cacheTag("user");

  const db = createServerClient();
  const result = await withSupabaseRevalidationTimeout(
    db
      .from("business_profiles")
      .select("*")
      .eq(tenantColumn, tenantId)
      .single(),
    "business profile query",
  );

  if (result.error) {
    throwForStaleCacheOnTimeout(result.error, "business profile query");
  }

  return result;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accountEmail = session.user.email ?? null;
    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    const tenantColumn = getTenantScopeColumn(businessContext);
    const tenantId = getTenantScopeId(businessContext);

    const { data, error } = await getBusinessProfile(tenantColumn, tenantId);

    if (error && error.code !== "PGRST116") {
      Sentry.captureException(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({
    role: businessContext.role,
    isOwner: businessContext.isOwner,
    profile: data
      ? {
          ...data,
          business_email: accountEmail,
        }
      : {
          business_email: accountEmail,
        },
  });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accountEmail = session.user.email ?? null;

    const body = await req.json();

    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    if (!businessContext.isOwner) {
      return NextResponse.json(
        {
          error: "Only business owners can update business-wide settings.",
        },
        { status: 403 },
      );
    }
    try {
      assertNoBusinessIdOverride(
        body && typeof body === "object"
          ? (body as Record<string, unknown>).business_id
          : undefined,
        businessContext,
      );
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Forbidden" },
        { status: 403 },
      );
    }
    const upsertPayload: Record<string, unknown> = {
      user_id: session.user.id,
      business_name: String(body.business_name ?? "").slice(0, 200) || null,
      business_tax_id: String(body.business_tax_id ?? "").slice(0, 100) || null,
      business_phone: String(body.business_phone ?? "").slice(0, 50) || null,
      business_email: accountEmail,
      business_address: String(body.business_address ?? "").slice(0, 500) || null,
      business_website: String(body.business_website ?? "").slice(0, 200) || null,
      logo_url: body.logo_url ? String(body.logo_url).slice(0, 500) : null,
    };
    if (!businessContext.usesLegacyUserScope) {
      upsertPayload.business_id = businessContext.businessId;
    }

    const { error } = await db.from("business_profiles").upsert(upsertPayload, {
      onConflict: businessContext.usesLegacyUserScope ? "user_id" : "business_id",
    });

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    revalidateTag("user", "max");
    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
