import type { SupabaseClient } from "@supabase/supabase-js";
import type { BusinessContext } from "@/lib/supabase/business";
import { getTenantScopeColumn, getTenantScopeId } from "@/lib/supabase/business";

/**
 * Verify a saved_estimates row belongs to the session tenant (business or legacy user).
 */
export async function loadEstimateScope(
  db: SupabaseClient,
  estimateId: string,
  businessContext: BusinessContext,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);

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
