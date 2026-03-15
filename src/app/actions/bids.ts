"use server";

import { revalidateTag } from "next/cache";
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

const VALID_BID_STATUSES = ["Draft", "Sent", "Approved", "Lost"] as const;

type BidStatus = (typeof VALID_BID_STATUSES)[number];

type BidActionResult = {
  ok: boolean;
  error?: string;
};

type UpdateBidStatusInput = {
  bidId: string;
  status: BidStatus;
};

type UpdateBidDetailsInput = {
  bidId: string;
  name?: string | null;
  totalCost?: number | null;
  clientName?: string | null;
  jobSiteAddress?: string | null;
  status?: BidStatus;
};

function isValidBidStatus(status: string): status is BidStatus {
  return (VALID_BID_STATUSES as readonly string[]).includes(status);
}

function revalidateFinancialDashboard(businessId: string, estimateId?: string) {
  revalidateTag(FINANCIAL_DASHBOARD_TAG, "max");
  revalidateTag(getFinancialDashboardTag(businessId), "max");
  revalidateTag(SAVED_ESTIMATES_TAG, "max");
  revalidateTag(getSavedEstimatesTag(businessId), "max");
  if (estimateId) {
    revalidateTag(getEstimateTag(estimateId), "max");
  }
}

async function canUpdateBid(
  db: ReturnType<typeof createServerClient>,
  bidId: string,
  tenantColumn: "business_id" | "user_id",
  tenantId: string,
): Promise<{ allowed: boolean; error?: string }> {
  const { data, error } = await db
    .from("saved_estimates")
    .select("id, business_id, user_id")
    .eq("id", bidId)
    .maybeSingle();

  if (error) {
    return { allowed: false, error: "Failed to verify bid permissions." };
  }

  if (!data) {
    return { allowed: false, error: "Bid not found." };
  }

  const scopedTenantId =
    tenantColumn === "business_id" ? data.business_id : data.user_id;

  if (scopedTenantId !== tenantId) {
    return {
      allowed: false,
      error: "This bid belongs to a different business workspace.",
    };
  }

  return { allowed: true };
}

export async function updateBidStatusAction(
  input: UpdateBidStatusInput,
): Promise<BidActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const bidId = input.bidId?.trim();
  if (!bidId) {
    return { ok: false, error: "Bid id is required." };
  }

  if (!isValidBidStatus(input.status)) {
    return { ok: false, error: "Invalid bid status." };
  }

  const db = createServerClient();
  const businessContext = await getBusinessContextForSession(db, session);
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);
  const permission = await canUpdateBid(db, bidId, tenantColumn, tenantId);
  if (!permission.allowed) {
    return { ok: false, error: permission.error };
  }

  const { error } = await db
    .from("saved_estimates")
    .update({ status: input.status })
    .eq("id", bidId)
    .eq(tenantColumn, tenantId);

  if (error) {
    console.error("updateBidStatusAction error:", error.message);
    return { ok: false, error: "Failed to update bid status." };
  }

  revalidateFinancialDashboard(tenantId, bidId);
  return { ok: true };
}

export async function updateBidDetailsAction(
  input: UpdateBidDetailsInput,
): Promise<BidActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const bidId = input.bidId?.trim();
  if (!bidId) {
    return { ok: false, error: "Bid id is required." };
  }

  if (input.status && !isValidBidStatus(input.status)) {
    return { ok: false, error: "Invalid bid status." };
  }

  const updates: {
    name?: string | null;
    total_cost?: number | null;
    client_name?: string | null;
    job_site_address?: string | null;
    status?: BidStatus;
  } = {};

  if (input.name !== undefined) {
    updates.name = input.name ? input.name.slice(0, 200) : null;
  }

  if (input.totalCost !== undefined) {
    updates.total_cost =
      input.totalCost === null
        ? null
        : Number.isFinite(input.totalCost)
          ? input.totalCost
          : null;
  }

  if (input.clientName !== undefined) {
    updates.client_name = input.clientName
      ? input.clientName.slice(0, 200)
      : null;
  }

  if (input.jobSiteAddress !== undefined) {
    updates.job_site_address = input.jobSiteAddress
      ? input.jobSiteAddress.slice(0, 500)
      : null;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  if (!Object.keys(updates).length) {
    return { ok: false, error: "No bid fields provided for update." };
  }

  const db = createServerClient();
  const businessContext = await getBusinessContextForSession(db, session);
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);
  const permission = await canUpdateBid(db, bidId, tenantColumn, tenantId);
  if (!permission.allowed) {
    return { ok: false, error: permission.error };
  }

  const { error } = await db
    .from("saved_estimates")
    .update(updates)
    .eq("id", bidId)
    .eq(tenantColumn, tenantId);

  if (error) {
    console.error("updateBidDetailsAction error:", error.message);
    return { ok: false, error: "Failed to update bid." };
  }

  revalidateFinancialDashboard(tenantId, bidId);
  return { ok: true };
}
