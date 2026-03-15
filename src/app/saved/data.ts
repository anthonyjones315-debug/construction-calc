import { cacheTag } from "next/cache";
import type { SavedEstimate } from "@/components/financial/FinancialDashboard";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForUserId,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import { SAVED_ESTIMATES_TAG, getSavedEstimatesTag } from "@/lib/cache-tags";
import {
  throwForStaleCacheOnTimeout,
  withSupabaseRevalidationTimeout,
} from "@/lib/supabase/stale-cache";

const SAVED_ESTIMATE_SELECT =
  "id, name, calculator_id, inputs, total_cost, status, budget_items, created_at, updated_at, results, client_name, job_site_address";

export async function getSavedEstimatesForUser(
  userId: string,
): Promise<SavedEstimate[]> {
  "use cache";

  const db = createServerClient();
  const businessContext = await getBusinessContextForUserId(db, userId);
  if (!businessContext) {
    return [];
  }
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);

  cacheTag(SAVED_ESTIMATES_TAG);
  cacheTag(getSavedEstimatesTag(tenantId));

  const { data, error } = await withSupabaseRevalidationTimeout(
    db
      .from("saved_estimates")
      .select(SAVED_ESTIMATE_SELECT)
      .eq(tenantColumn, tenantId)
      .order("created_at", { ascending: false }),
    "saved estimates list query",
  );

  if (error) {
    throwForStaleCacheOnTimeout(error, "saved estimates list query");
    console.error("getSavedEstimatesForUser error:", error.message);
    return [];
  }

  return (data ?? []) as SavedEstimate[];
}

export async function getSavedEstimatesForUserFresh(
  userId: string,
): Promise<SavedEstimate[]> {
  const db = createServerClient();
  const businessContext = await getBusinessContextForUserId(db, userId);
  if (!businessContext) {
    return [];
  }
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);

  const { data, error } = await db
    .from("saved_estimates")
    .select(SAVED_ESTIMATE_SELECT)
    .eq(tenantColumn, tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSavedEstimatesForUserFresh error:", error.message);
    return [];
  }

  return (data ?? []) as SavedEstimate[];
}
