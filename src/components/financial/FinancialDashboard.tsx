"use client";

import { AlertTriangle, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";
import type { CalculationResult } from "@/types";
import type { FinancialData } from "@/components/financial/FinancialDataFetcher";

type EstimateStatus = "Draft" | "Sent" | "Approved" | "Lost";

const USD_CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export interface SavedEstimate {
  id: string;
  name: string;
  calculator_id: string;
  inputs?: Record<string, unknown> | null;
  client_name?: string | null;
  job_site_address?: string | null;
  total_cost: number | null;
  status?: EstimateStatus | null;
  budget_items?: unknown[] | null;
  created_at: string;
  updated_at?: string;
  results: CalculationResult[];
}

type FinancialDashboardProps = {
  estimates: SavedEstimate[];
  refreshing: boolean;
  lastUpdatedAt: Date | null;
  serverData?: FinancialData;
};

type ProjectMargin = {
  id: string;
  name: string;
  status: EstimateStatus;
  margin: number | null;
  revenue: number;
  projectCost: number | null;
  costBasis: "estimated" | "actual" | "mixed" | null;
  updatedAt: string;
};

type CostBucket = "material" | "labor";

type VarianceAlert = {
  projectId: string;
  projectName: string;
  bucket: CostBucket;
  estimated: number;
  actual: number;
  delta: number;
  deltaPercent: number;
  updatedAt: string;
};

const LABOR_KEYWORDS = [
  "labor",
  "labour",
  "crew",
  "hour",
  "hours",
  "wage",
  "install",
  "installer",
  "carpenter",
  "electrician",
  "plumber",
  "foreman",
] as const;

const MATERIAL_KEYWORDS = [
  "material",
  "lumber",
  "concrete",
  "drywall",
  "paint",
  "steel",
  "tile",
  "roof",
  "insulation",
  "siding",
  "supply",
] as const;

function toFiniteNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toOptionalFiniteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getEstimateStatus(estimate: SavedEstimate): EstimateStatus {
  const status = estimate.status;
  if (
    status === "Draft" ||
    status === "Sent" ||
    status === "Approved" ||
    status === "Lost"
  ) {
    return status;
  }

  return "Draft";
}

function getBudgetItemCost(item: unknown): number {
  if (!item || typeof item !== "object") return 0;

  const row = item as Record<string, unknown>;
  const quantity =
    toFiniteNumber(row.quantity) ||
    toFiniteNumber(row.qty) ||
    toFiniteNumber(row.units) ||
    1;
  const unitCost =
    toFiniteNumber(row.pricePerUnit) ||
    toFiniteNumber(row.unit_cost) ||
    toFiniteNumber(row.unitCost) ||
    toFiniteNumber(row.cost) ||
    toFiniteNumber(row.amount);

  if (quantity <= 0 || unitCost <= 0) return 0;

  return quantity * unitCost;
}

function getBudgetItemBucket(item: unknown): CostBucket | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const searchableText = [
    row.category,
    row.type,
    row.cost_type,
    row.costType,
    row.group,
    row.itemType,
    row.name,
    row.label,
    row.unit,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (LABOR_KEYWORDS.some((keyword) => searchableText.includes(keyword))) {
    return "labor";
  }

  if (MATERIAL_KEYWORDS.some((keyword) => searchableText.includes(keyword))) {
    return "material";
  }

  return null;
}

function getNumberFromKeys(
  row: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const parsed = toOptionalFiniteNumber(row[key]);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function getEstimateAndActualCost(item: unknown): {
  estimated: number | null;
  actual: number | null;
} {
  if (!item || typeof item !== "object") {
    return { estimated: null, actual: null };
  }

  const row = item as Record<string, unknown>;
  const explicitEstimated = getNumberFromKeys(row, [
    "estimated_cost",
    "estimatedCost",
    "estimate_cost",
    "estimateCost",
    "estimate",
    "planned_cost",
    "plannedCost",
    "budget_cost",
    "budgetCost",
    "original_estimate",
    "originalEstimate",
  ]);
  const explicitActual = getNumberFromKeys(row, [
    "actual_cost",
    "actualCost",
    "actual",
    "spent",
    "actual_amount",
    "actualAmount",
    "final_cost",
    "finalCost",
  ]);

  const estimatedQuantity =
    getNumberFromKeys(row, ["quantity", "qty", "units"]) ?? 1;
  const estimatedUnit = getNumberFromKeys(row, [
    "pricePerUnit",
    "unit_cost",
    "unitCost",
    "estimated_rate",
    "estimatedRate",
    "rate",
    "cost",
    "amount",
  ]);

  const actualQuantity =
    getNumberFromKeys(row, [
      "actual_quantity",
      "actualQuantity",
      "actual_qty",
    ]) ?? null;
  const actualUnit = getNumberFromKeys(row, [
    "actual_price_per_unit",
    "actualPricePerUnit",
    "actual_unit_cost",
    "actualUnitCost",
    "actual_rate",
    "actualRate",
  ]);

  const inferredEstimated =
    estimatedUnit !== null && estimatedQuantity > 0
      ? estimatedQuantity * estimatedUnit
      : null;
  const inferredActual =
    actualUnit !== null && actualQuantity !== null && actualQuantity > 0
      ? actualQuantity * actualUnit
      : null;

  return {
    estimated: explicitEstimated ?? inferredEstimated,
    actual: explicitActual ?? inferredActual,
  };
}

function getVarianceAlerts(estimate: SavedEstimate): VarianceAlert[] {
  if (
    !Array.isArray(estimate.budget_items) ||
    estimate.budget_items.length === 0
  ) {
    return [];
  }

  const totalsByBucket: Record<
    CostBucket,
    { estimated: number; actual: number; hasActual: boolean }
  > = {
    material: { estimated: 0, actual: 0, hasActual: false },
    labor: { estimated: 0, actual: 0, hasActual: false },
  };

  for (const item of estimate.budget_items) {
    const bucket = getBudgetItemBucket(item);
    if (!bucket) {
      continue;
    }

    const { estimated, actual } = getEstimateAndActualCost(item);

    if (estimated !== null && estimated > 0) {
      totalsByBucket[bucket].estimated += estimated;
    }

    if (actual !== null && actual > 0) {
      totalsByBucket[bucket].actual += actual;
      totalsByBucket[bucket].hasActual = true;
    }
  }

  const updatedAt = estimate.updated_at ?? estimate.created_at;

  return (Object.keys(totalsByBucket) as CostBucket[])
    .filter((bucket) => {
      const totals = totalsByBucket[bucket];
      return (
        totals.hasActual &&
        totals.estimated > 0 &&
        totals.actual > totals.estimated
      );
    })
    .map((bucket) => {
      const totals = totalsByBucket[bucket];
      const delta = totals.actual - totals.estimated;
      return {
        projectId: estimate.id,
        projectName: estimate.name,
        bucket,
        estimated: totals.estimated,
        actual: totals.actual,
        delta,
        deltaPercent: (delta / totals.estimated) * 100,
        updatedAt,
      };
    });
}

function getTrackedProjectCost(estimate: SavedEstimate): {
  cost: number | null;
  basis: "estimated" | "actual" | "mixed" | null;
} {
  if (
    !Array.isArray(estimate.budget_items) ||
    estimate.budget_items.length === 0
  ) {
    return { cost: null, basis: null };
  }

  let total = 0;
  let usedActualCount = 0;
  let usedEstimatedCount = 0;

  for (const item of estimate.budget_items) {
    const { estimated, actual } = getEstimateAndActualCost(item);

    if (actual !== null && actual > 0) {
      total += actual;
      usedActualCount += 1;
      continue;
    }

    if (estimated !== null && estimated > 0) {
      total += estimated;
      usedEstimatedCount += 1;
      continue;
    }

    const fallback = getBudgetItemCost(item);
    if (fallback > 0) {
      total += fallback;
      usedEstimatedCount += 1;
    }
  }

  const basis =
    usedActualCount > 0 && usedEstimatedCount > 0
      ? "mixed"
      : usedActualCount > 0
        ? "actual"
        : usedEstimatedCount > 0
          ? "estimated"
          : null;

  return { cost: total > 0 ? total : null, basis };
}

export function getProjectProfitMargin(estimate: SavedEstimate): number | null {
  const revenue = toFiniteNumber(estimate.total_cost);
  const trackedCost = getTrackedProjectCost(estimate).cost;

  if (revenue <= 0 || trackedCost === null) return null;

  return ((revenue - trackedCost) / revenue) * 100;
}

export function formatStatus(status: EstimateStatus): string {
  return status === "Approved" ? "Billed" : status;
}

function computeFinancialDashboard(estimates: SavedEstimate[]) {
  const projectMargins = estimates
    .map<ProjectMargin>((estimate) => {
      const revenue = toFiniteNumber(estimate.total_cost);
      const trackedProjectCost = getTrackedProjectCost(estimate);
      const margin = getProjectProfitMargin(estimate);

      return {
        id: estimate.id,
        name: estimate.name,
        status: getEstimateStatus(estimate),
        margin,
        revenue,
        projectCost: trackedProjectCost.cost,
        costBasis: trackedProjectCost.basis,
        updatedAt: estimate.updated_at ?? estimate.created_at,
      };
    })
    .sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const billedProjects = projectMargins.filter((project) => {
    return project.status === "Approved";
  });
  const unbilledProjects = projectMargins.filter((project) => {
    return project.status === "Draft" || project.status === "Sent";
  });
  const marginProjects = projectMargins.filter((project) => {
    return (
      project.margin !== null &&
      project.projectCost !== null &&
      project.revenue > 0
    );
  });

  const billedAmount = billedProjects.reduce((sum, project) => {
    return sum + project.revenue;
  }, 0);
  const unbilledAmount = unbilledProjects.reduce((sum, project) => {
    return sum + project.revenue;
  }, 0);
  const marginRevenueTotal = marginProjects.reduce((sum, project) => {
    return sum + project.revenue;
  }, 0);
  const marginGrossProfitTotal = marginProjects.reduce((sum, project) => {
    return sum + (project.revenue - (project.projectCost ?? 0));
  }, 0);

  const portfolioMargin =
    marginRevenueTotal > 0
      ? (marginGrossProfitTotal / marginRevenueTotal) * 100
      : null;

  const varianceAlerts = estimates
    .flatMap((estimate) => getVarianceAlerts(estimate))
    .sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return {
    billedAmount,
    billedCount: billedProjects.length,
    unbilledAmount,
    unbilledCount: unbilledProjects.length,
    portfolioMargin,
    projectMargins,
    varianceAlerts,
  };
}

export function FinancialDashboard({
  estimates,
  refreshing,
  lastUpdatedAt,
  serverData,
}: FinancialDashboardProps) {
  const financialDashboard = useMemo(() => {
    return computeFinancialDashboard(estimates);
  }, [estimates]);

  const billedAmount =
    serverData?.billed.total ?? financialDashboard.billedAmount;
  const billedCount =
    serverData?.billed.count ?? financialDashboard.billedCount;
  const unbilledAmount =
    serverData?.unbilled.total ?? financialDashboard.unbilledAmount;
  const unbilledCount =
    serverData?.unbilled.count ?? financialDashboard.unbilledCount;

  return (
    <section className="mb-6 space-y-3">
      <p className="text-xs text-[--color-ink-dim]">
        {refreshing
          ? "Refreshing live metrics…"
          : "Live metrics update every 15s"}
        {lastUpdatedAt
          ? ` · Last sync ${lastUpdatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
          : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="content-card p-4">
          <p className="text-xs uppercase tracking-wide text-[--color-ink-dim] font-semibold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" aria-hidden />
            Billed
          </p>
          <p className="text-2xl font-display font-bold text-[--color-ink] mt-2">
            {USD_CURRENCY.format(billedAmount)}
          </p>
          <p className="text-xs text-[--color-ink-dim] mt-1">
            {billedCount} approved project
            {billedCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="content-card p-4">
          <p className="text-xs uppercase tracking-wide text-[--color-ink-dim] font-semibold flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" aria-hidden />
            Unbilled
          </p>
          <p className="text-2xl font-display font-bold text-[--color-ink] mt-2">
            {USD_CURRENCY.format(unbilledAmount)}
          </p>
          <p className="text-xs text-[--color-ink-dim] mt-1">
            {unbilledCount} draft/sent project
            {unbilledCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="content-card p-4">
          <p className="text-xs uppercase tracking-wide text-[--color-ink-dim] font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden />
            Portfolio Margin
          </p>
          <p className="text-2xl font-display font-bold text-[--color-ink] mt-2">
            {financialDashboard.portfolioMargin === null
              ? "—"
              : `${financialDashboard.portfolioMargin.toFixed(1)}%`}
          </p>
          <p className="text-xs text-[--color-ink-dim] mt-1">
            Live from project revenue vs estimated costs
          </p>
        </div>
      </div>

      {financialDashboard.varianceAlerts.length > 0 && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-4">
          <p className="text-xs uppercase tracking-wide text-red-600 font-semibold mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
            Cost Variance Alerts
          </p>
          <div className="space-y-2">
            {financialDashboard.varianceAlerts.map((alert) => (
              <div
                key={`${alert.projectId}-${alert.bucket}`}
                className="rounded-lg border border-red-500/15 px-3 py-2"
              >
                <p className="text-sm font-semibold text-[--color-ink]">
                  {alert.projectName}
                </p>
                <p className="text-xs text-[--color-ink-dim] mt-0.5">
                  {alert.bucket === "labor" ? "Labor" : "Material"} actual{" "}
                  {USD_CURRENCY.format(alert.actual)} exceeded estimate{" "}
                  {USD_CURRENCY.format(alert.estimated)} by{" "}
                  <span className="font-semibold text-red-600">
                    {USD_CURRENCY.format(alert.delta)} (
                    {alert.deltaPercent.toFixed(1)}%)
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="content-card p-4">
        <p className="text-xs uppercase tracking-wide text-[--color-ink-dim] font-semibold mb-3">
          Live Project Profit Margins
        </p>
        <div className="space-y-2">
          {financialDashboard.projectMargins.map((project) => (
            <div
              key={project.id}
              className="trim-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[--color-ink] truncate">
                  {project.name}
                </p>
                <p className="text-xs text-[--color-ink-dim] mt-0.5">
                  {formatStatus(project.status)} · Revenue{" "}
                  {USD_CURRENCY.format(project.revenue)}
                  {project.projectCost !== null
                    ? ` · ${project.costBasis === "actual" ? "Actual" : project.costBasis === "mixed" ? "Tracked" : "Estimated"} Cost ${USD_CURRENCY.format(project.projectCost)}`
                    : ""}
                </p>
              </div>
              <p
                className={`text-sm font-bold shrink-0 ${
                  project.margin === null
                    ? "text-[--color-ink-dim]"
                    : project.margin >= 0
                      ? "text-green-600"
                      : "text-red-500"
                }`}
              >
                {project.margin === null
                  ? "N/A"
                  : `${project.margin.toFixed(1)}%`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
