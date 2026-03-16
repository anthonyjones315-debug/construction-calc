import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import {
  getEstimateTag,
  getSavedEstimatesTag,
  getFinancialDashboardTag,
  FINANCIAL_DASHBOARD_TAG,
  SAVED_ESTIMATES_TAG,
} from "@/lib/cache-tags";
import { revalidateTag } from "next/cache";
import { buildSigningMeta, generateEstimateShareCode } from "@/lib/estimates/finalize";

async function loadEstimateScope(
  db: ReturnType<typeof createServerClient>,
  estimateId: string,
  tenantColumn: "business_id" | "user_id",
  tenantId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { data, error } = await db
    .from("saved_estimates")
    .select("id, business_id, user_id")
    .eq("id", estimateId)
    .maybeSingle();

  if (error) {
    return { ok: false, status: 500, error: error.message };
  }

  if (!data) {
    return { ok: false, status: 404, error: "Estimate not found." };
  }

  const scopedTenantId =
    tenantColumn === "business_id" ? data.business_id : data.user_id;

  if (scopedTenantId !== tenantId) {
    return {
      ok: false,
      status: 403,
      error: "This estimate belongs to a different business workspace.",
    };
  }

  return { ok: true };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    const tenantColumn = getTenantScopeColumn(businessContext);
    const tenantId = getTenantScopeId(businessContext);
    const permission = await loadEstimateScope(db, id, tenantColumn, tenantId);
    if (!permission.ok) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.status },
      );
    }

    const { data: estimateRow, error: estimateError } = await db
      .from("saved_estimates")
      .select("id, inputs")
      .eq("id", id)
      .eq(tenantColumn, tenantId)
      .single();

    if (estimateError || !estimateRow) {
      return NextResponse.json(
        { error: estimateError?.message ?? "Estimate not found." },
        { status: estimateError ? 500 : 404 },
      );
    }

    let shareCode = generateEstimateShareCode();
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const signing = buildSigningMeta(shareCode);
      const inputs =
        estimateRow.inputs && typeof estimateRow.inputs === "object"
          ? estimateRow.inputs
          : {};

      const { error } = await db
        .from("saved_estimates")
        .update({
          share_code: shareCode,
          inputs: {
            ...inputs,
            signing,
          },
        })
        .eq("id", id)
        .eq(tenantColumn, tenantId);

      if (!error) {
        revalidateTag(FINANCIAL_DASHBOARD_TAG, "max");
        revalidateTag(getFinancialDashboardTag(tenantId), "max");
        revalidateTag(SAVED_ESTIMATES_TAG, "max");
        revalidateTag(getSavedEstimatesTag(tenantId), "max");
        revalidateTag(getEstimateTag(id), "max");
        return NextResponse.json({ share_code: shareCode });
      }

      if (error.code === "23505") {
        shareCode = generateEstimateShareCode();
        attempts++;
        continue;
      }

      Sentry.captureException(error);
      return NextResponse.json(
        { error: "Failed to update share code." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Could not generate unique share code. Try again." },
      { status: 500 },
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
