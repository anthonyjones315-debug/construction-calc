import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import {
  FINANCIAL_DASHBOARD_TAG,
  SAVED_ESTIMATES_TAG,
  getEstimateTag,
  getFinancialDashboardTag,
  getSavedEstimatesTag,
} from "@/lib/cache-tags";
import { isEstimateStatus, type EstimateStatus } from "@/lib/estimates/status";
import { normalizeDollars } from "@/utils/money";
import { verifyEstimate } from "@/app/actions/calculations";

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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    if (!businessContext.canDeleteBusinessData) {
      return NextResponse.json(
        { error: "Only business owners or admins can delete shared estimates." },
        { status: 403 },
      );
    }
    const tenantColumn = getTenantScopeColumn(businessContext);
    const tenantId = getTenantScopeId(businessContext);
    const permission = await loadEstimateScope(db, id, tenantColumn, tenantId);
    if (!permission.ok) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.status },
      );
    }

    const { error } = await db
      .from("saved_estimates")
      .delete()
      .eq("id", id)
      .eq(tenantColumn, tenantId);

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    revalidateTag(FINANCIAL_DASHBOARD_TAG, "max");
    revalidateTag(getFinancialDashboardTag(tenantId), "max");
    revalidateTag(SAVED_ESTIMATES_TAG, "max");
    revalidateTag(getSavedEstimatesTag(tenantId), "max");
    revalidateTag(getEstimateTag(id), "max");

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    let body: {
      name?: string;
      total_cost?: number | null;
      client_name?: string | null;
      job_site_address?: string | null;
      status?: EstimateStatus;
      budget_items?: unknown[] | null;
      inputs?: Record<string, unknown> | null;
      share_code?: string | null;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const updates: {
      name?: string | null;
      total_cost?: number | null;
      client_name?: string | null;
      job_site_address?: string | null;
      status?: EstimateStatus;
      budget_items?: unknown[] | null;
      inputs?: Record<string, unknown> | null;
      share_code?: string | null;
      subtotal_cents?: number | null;
      tax_cents?: number | null;
      total_cents?: number | null;
      tax_basis_points?: number | null;
      verified_county?: string | null;
      verification_status?: string;
    } = {};

    if (body.name !== undefined)
      updates.name = body.name.trim().slice(0, 200) || null;
    if (body.total_cost !== undefined) {
      updates.total_cost =
        body.total_cost === null
          ? null
          : Number.isFinite(body.total_cost)
            ? normalizeDollars(body.total_cost)
            : null;
    }
    if (body.client_name !== undefined) {
      updates.client_name = body.client_name
        ? body.client_name.slice(0, 200)
        : null;
    }
    if (body.job_site_address !== undefined) {
      updates.job_site_address = body.job_site_address
        ? body.job_site_address.slice(0, 500)
        : null;
    }
    if (body.status !== undefined) {
      if (!isEstimateStatus(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value." },
          { status: 400 },
        );
      }
      updates.status = body.status;
    }

    if (body.budget_items !== undefined) {
      updates.budget_items = Array.isArray(body.budget_items)
        ? body.budget_items
        : null;
    }

    if (body.inputs !== undefined) {
      updates.inputs =
        body.inputs && typeof body.inputs === "object" ? body.inputs : null;
    }

    if (body.share_code !== undefined) {
      updates.share_code =
        typeof body.share_code === "string" && body.share_code.trim()
          ? body.share_code.trim().slice(0, 32)
          : null;
    }

    if (updates.total_cost !== undefined || updates.inputs !== undefined) {
      const verified = verifyEstimate({
        inputs: updates.inputs,
        total_cost: updates.total_cost ?? null,
      });
      updates.subtotal_cents = verified.subtotal_cents;
      updates.tax_cents = verified.tax_cents;
      updates.total_cents = verified.total_cents;
      updates.tax_basis_points = verified.tax_basis_points;
      updates.verified_county = verified.verified_county;
      updates.verification_status = verified.verification_status;
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: "No updates provided." },
        { status: 400 },
      );
    }

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

    const { error } = await db
      .from("saved_estimates")
      .update(updates)
      .eq("id", id)
      .eq(tenantColumn, tenantId);

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    revalidateTag(FINANCIAL_DASHBOARD_TAG, "max");
    revalidateTag(getFinancialDashboardTag(tenantId), "max");
    revalidateTag(SAVED_ESTIMATES_TAG, "max");
    revalidateTag(getSavedEstimatesTag(tenantId), "max");
    revalidateTag(getEstimateTag(id), "max");

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
