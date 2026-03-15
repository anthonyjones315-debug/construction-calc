import type { ReactNode } from "react";
import { cacheTag } from "next/cache";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForUserId,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import {
  FINANCIAL_DASHBOARD_TAG,
  getFinancialDashboardTag,
} from "@/lib/cache-tags";
import {
  throwForStaleCacheOnTimeout,
  withSupabaseRevalidationTimeout,
} from "@/lib/supabase/stale-cache";

const EMPTY_AGGREGATE = { count: 0, total: 0 } as const;

type FinancialAggregate = {
  count: number;
  total: number;
};

export type FinancialData = {
  billed: FinancialAggregate;
  unbilled: FinancialAggregate;
};

type FinancialDataFetcherProps = {
  children: (data: FinancialData) => ReactNode;
};

function sumTotalCost(
  rows: Array<{ total_cost: number | string | null }> | null,
): number {
  if (!rows?.length) {
    return 0;
  }

  return rows.reduce((runningTotal, row) => {
    const parsed = Number(row.total_cost ?? 0);
    return Number.isFinite(parsed) ? runningTotal + parsed : runningTotal;
  }, 0);
}

async function getBilledAggregate(
  tenantColumn: "business_id" | "user_id",
  tenantId: string,
): Promise<FinancialAggregate> {
  "use cache";
  cacheTag(FINANCIAL_DASHBOARD_TAG);
  cacheTag(getFinancialDashboardTag(tenantId));

  const db = createServerClient();
  const { data, error, count } = await withSupabaseRevalidationTimeout(
    db
      .from("saved_estimates")
      .select("total_cost", { count: "exact" })
      .eq(tenantColumn, tenantId)
      .eq("status", "Approved"),
    "financial billed aggregate query",
  );

  if (error) {
    throwForStaleCacheOnTimeout(error, "financial billed aggregate query");
    console.error(
      "FinancialDataFetcher billed aggregate error:",
      error.message,
    );
    return { ...EMPTY_AGGREGATE };
  }

  return {
    count: count ?? 0,
    total: sumTotalCost(data),
  };
}

async function getUnbilledAggregate(
  tenantColumn: "business_id" | "user_id",
  tenantId: string,
): Promise<FinancialAggregate> {
  "use cache";
  cacheTag(FINANCIAL_DASHBOARD_TAG);
  cacheTag(getFinancialDashboardTag(tenantId));

  const db = createServerClient();
  const { data, error, count } = await withSupabaseRevalidationTimeout(
    db
      .from("saved_estimates")
      .select("total_cost", { count: "exact" })
      .eq(tenantColumn, tenantId)
      .in("status", ["Draft", "Sent"]),
    "financial unbilled aggregate query",
  );

  if (error) {
    throwForStaleCacheOnTimeout(error, "financial unbilled aggregate query");
    console.error(
      "FinancialDataFetcher unbilled aggregate error:",
      error.message,
    );
    return { ...EMPTY_AGGREGATE };
  }

  return {
    count: count ?? 0,
    total: sumTotalCost(data),
  };
}

export async function getFinancialDataForUser(
  userId: string,
): Promise<FinancialData> {
  const db = createServerClient();
  const businessContext = await getBusinessContextForUserId(db, userId);
  if (!businessContext) {
    return {
      billed: { ...EMPTY_AGGREGATE },
      unbilled: { ...EMPTY_AGGREGATE },
    };
  }

  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);

  const [billed, unbilled] = await Promise.all([
    getBilledAggregate(tenantColumn, tenantId),
    getUnbilledAggregate(tenantColumn, tenantId),
  ]);

  return { billed, unbilled };
}

export default async function FinancialDataFetcher({
  children,
}: FinancialDataFetcherProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return children({
      billed: { ...EMPTY_AGGREGATE },
      unbilled: { ...EMPTY_AGGREGATE },
    });
  }

  const financialData = await getFinancialDataForUser(session.user.id);
  return children(financialData);
}
