import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  canWriteBusinessData,
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
import {
  SHARE_CODE_UNAVAILABLE_MESSAGE,
  isMissingShareCodeColumnError,
} from "@/lib/estimates/share-code-support";
import { loadEstimateScope } from "@/lib/supabase/estimate-scope";

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
    if (!canWriteBusinessData(businessContext.role)) {
      return NextResponse.json(
        { error: "Only owners, admins, or editors can rotate share codes." },
        { status: 403 },
      );
    }
    const tenantColumn = getTenantScopeColumn(businessContext);
    const tenantId = getTenantScopeId(businessContext);
    const permission = await loadEstimateScope(db, id, businessContext);
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
      const inputs =
        estimateRow.inputs && typeof estimateRow.inputs === "object"
          ? estimateRow.inputs
          : {};
      const existingSigning =
        inputs.signing && typeof inputs.signing === "object"
          ? (inputs.signing as Record<string, unknown>)
          : {};
      const signing = {
        ...existingSigning,
        ...buildSigningMeta(shareCode),
      };

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

      if (isMissingShareCodeColumnError(error)) {
        return NextResponse.json(
          { error: SHARE_CODE_UNAVAILABLE_MESSAGE },
          { status: 503 },
        );
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
