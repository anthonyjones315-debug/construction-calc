import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
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
  FINANCIAL_DASHBOARD_TAG,
  SAVED_ESTIMATES_TAG,
  getEstimateTag,
  getFinancialDashboardTag,
  getSavedEstimatesTag,
} from "@/lib/cache-tags";
import {
  SHARE_CODE_UNAVAILABLE_MESSAGE,
  isMissingShareCodeColumnError,
} from "@/lib/estimates/share-code-support";
import { isEstimateStatus, type EstimateStatus } from "@/lib/estimates/status";
import { normalizeDollars } from "@/utils/money";
import { verifyEstimate } from "@/app/actions/calculations";
import { loadEstimateScope } from "@/lib/supabase/estimate-scope";
import { generateAutoEstimateName } from "@/lib/estimates/name-generator";

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
    const permission = await loadEstimateScope(db, id, businessContext);
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
      version?: number;

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
    if (!canWriteBusinessData(businessContext.role)) {
      return NextResponse.json(
        { error: "Only owners, admins, or editors can update shared estimates." },
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

    // Auto-Name generation for updates
    let projectName = updates.inputs?.project_name as string | undefined;
    if (!projectName && typeof updates.name === "string") {
      projectName = updates.name; // Use existing name if project name isn't changing
    }
    const generatedName = await generateAutoEstimateName(
      db,
      tenantId,
      tenantColumn,
      updates.client_name,
      projectName,
      updates.job_site_address,
      id
    );
    updates.name = generatedName;

    // Fetch previous state for revision tracking
    const { data: previousEstimate } = await db
      .from("saved_estimates")
      .select("*")
      .eq("id", id)
      .eq(tenantColumn, tenantId)
      .single();

    const currentVersion = previousEstimate?.version || 1;
    updates.version = currentVersion + 1;

    // Insert revision snapshot
    if (previousEstimate) {
      await db.from("estimate_revisions").insert({
        estimate_id: id,
        author_id: session.user.id,
        author_name: session.user.name || session.user.email || 'Unknown User',
        revision_number: currentVersion,
        snapshot: previousEstimate,
        change_summary: "Updated via app"
      });
    }

    const updateEstimate = (payload: typeof updates) =>
      db
        .from("saved_estimates")
        .update(payload)
        .eq("id", id)
        .eq(tenantColumn, tenantId);

    let { error } = await updateEstimate(updates);

    if (error && isMissingShareCodeColumnError(error)) {
      const retryUpdates = { ...updates };
      delete retryUpdates.share_code;

      if (!Object.keys(retryUpdates).length) {
        return NextResponse.json(
          { error: SHARE_CODE_UNAVAILABLE_MESSAGE },
          { status: 503 },
        );
      }

      ({ error } = await updateEstimate(retryUpdates));
    }

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
