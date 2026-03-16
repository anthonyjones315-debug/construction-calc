import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getTenantScopeColumn,
  getTenantScopeId,
  type BusinessContext,
} from "@/lib/supabase/business";

/**
 * Central helper to ensure every table fetch is tenant scoped.
 * This keeps tests simple and avoids forgetting the tenant filter.
 */
export function tenantScopedSelect<T extends string>(
  db: Pick<SupabaseClient, "from">,
  table: T,
  columns: string,
  context: BusinessContext,
) {
  const tenantColumn = getTenantScopeColumn(context);
  const tenantId = getTenantScopeId(context);
  return db.from(table).select(columns).eq(tenantColumn, tenantId);
}
