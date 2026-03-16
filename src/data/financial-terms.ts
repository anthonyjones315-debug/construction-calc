export type FinancialTermKey =
  | "direct-cost"
  | "overhead-recovery"
  | "target-profit-margin"
  | "markup-on-cost"
  | "selling-price"
  | "gross-profit"
  | "gross-margin"
  | "base-wage"
  | "labor-burden"
  | "overhead-allocation"
  | "burdened-labor-rate"
  | "fully-loaded-rate"
  | "billable-rate"
  | "profit-per-hour"
  | "cost-per-lead"
  | "close-rate"
  | "average-job-value"
  | "customer-acquisition-cost"
  | "revenue-per-lead"
  | "payback-multiple"
  | "gross-revenue"
  | "blended-tax-rate"
  | "deductions"
  | "taxable-income"
  | "tax-owed"
  | "effective-tax-rate"
  | "net-income"
  | "tax-savings";

export type FinancialTerm = {
  key: FinancialTermKey;
  label: string;
  definition: string;
  unit?: string;
  aliases?: string[];
  formula?: string;
};

const FINANCIAL_TERMS_INTERNAL: FinancialTerm[] = [
  {
    key: "direct-cost",
    label: "Direct Cost",
    unit: "$",
    definition:
      "All variable job costs (labor, materials, subs) before overhead and profit.",
    aliases: ["job cost", "cost of goods", "cogs"],
  },
  {
    key: "overhead-recovery",
    label: "Overhead Recovery",
    unit: "%",
    definition: "Percent added to direct cost to cover company overhead.",
    aliases: ["overhead", "overhead rate"],
  },
  {
    key: "target-profit-margin",
    label: "Target Profit Margin",
    unit: "%",
    definition: "Desired profit as a percent of revenue after cost and overhead.",
    aliases: ["target margin", "profit margin"],
  },
  {
    key: "markup-on-cost",
    label: "Markup on Cost",
    unit: "%",
    definition: "Percent uplift applied to cost to reach selling price.",
    aliases: ["markup", "markup rate"],
  },
  {
    key: "selling-price",
    label: "Bid / Selling Price",
    unit: "$",
    definition: "Customer price that covers cost, overhead, and profit target.",
    aliases: ["sell price", "bid price"],
  },
  {
    key: "gross-profit",
    label: "Gross Profit",
    unit: "$",
    definition: "Selling price minus direct cost and overhead.",
    aliases: ["gross profit dollars"],
  },
  {
    key: "gross-margin",
    label: "Gross Margin",
    unit: "%",
    definition: "Gross profit expressed as a percent of selling price.",
    aliases: ["margin", "gross margin percent"],
    formula: "(Selling Price - Cost - Overhead) ÷ Selling Price",
  },
  {
    key: "base-wage",
    label: "Base Wage",
    unit: "$/hr",
    definition: "Hourly wage paid to the field worker before burden.",
    aliases: ["hourly rate", "pay rate"],
  },
  {
    key: "labor-burden",
    label: "Labor Burden",
    unit: "%",
    definition: "Payroll taxes, benefits, and insurance as a percent of wage.",
    aliases: ["burden", "burden rate"],
  },
  {
    key: "overhead-allocation",
    label: "Overhead Allocation",
    unit: "%",
    definition: "Share of company overhead assigned per labor hour.",
    aliases: ["overhead per hour", "labor overhead"],
  },
  {
    key: "burdened-labor-rate",
    label: "Burdened Labor Rate",
    unit: "$/hr",
    definition: "Base wage plus labor burden dollars.",
  },
  {
    key: "fully-loaded-rate",
    label: "Fully Loaded Rate",
    unit: "$/hr",
    definition: "Burdened rate plus overhead allocation.",
    aliases: ["loaded labor rate"],
  },
  {
    key: "billable-rate",
    label: "Billable Rate",
    unit: "$/hr",
    definition: "Charge rate to the customer that includes profit target.",
    aliases: ["charge rate", "sell rate"],
  },
  {
    key: "profit-per-hour",
    label: "Profit per Hour",
    unit: "$/hr",
    definition: "Billable rate minus fully loaded labor cost.",
  },
  {
    key: "cost-per-lead",
    label: "Cost per Lead",
    unit: "$",
    definition: "Marketing spend required to acquire a single lead.",
    aliases: ["cpl"],
  },
  {
    key: "close-rate",
    label: "Close Rate",
    unit: "%",
    definition: "Percent of leads that convert to sold jobs.",
    aliases: ["win rate", "conversion rate"],
  },
  {
    key: "average-job-value",
    label: "Average Job Value",
    unit: "$",
    definition: "Typical revenue per closed job.",
    aliases: ["avg ticket", "average revenue"],
  },
  {
    key: "customer-acquisition-cost",
    label: "Customer Acquisition Cost (CAC)",
    unit: "$",
    definition: "Cost to acquire a paying customer based on CPL and close rate.",
    aliases: ["cac"],
  },
  {
    key: "revenue-per-lead",
    label: "Revenue per Lead",
    unit: "$",
    definition: "Average revenue generated per inbound lead after close rate.",
  },
  {
    key: "payback-multiple",
    label: "Payback Ratio",
    unit: "x",
    definition: "Average job value divided by customer acquisition cost.",
    aliases: ["roas", "return on ad spend"],
  },
  {
    key: "gross-revenue",
    label: "Gross Revenue",
    unit: "$",
    definition: "Total top-line revenue before deductions and tax.",
    aliases: ["revenue"],
  },
  {
    key: "blended-tax-rate",
    label: "Blended Tax Rate",
    unit: "%",
    definition: "Combined state, local, and other applicable tax percentage.",
    aliases: ["tax rate"],
  },
  {
    key: "deductions",
    label: "Deductions",
    unit: "$",
    definition: "Deductible expenses taken before calculating tax.",
  },
  {
    key: "taxable-income",
    label: "Taxable Income",
    unit: "$",
    definition: "Revenue minus deductions used to calculate tax owed.",
  },
  {
    key: "tax-owed",
    label: "Projected Tax",
    unit: "$",
    definition: "Taxable income multiplied by the blended tax rate.",
  },
  {
    key: "effective-tax-rate",
    label: "Effective Tax Rate",
    unit: "%",
    definition: "Tax owed divided by gross revenue, expressed as a percent.",
  },
  {
    key: "net-income",
    label: "Net Income After Tax",
    unit: "$",
    definition: "Gross revenue minus projected tax owed.",
    aliases: ["after-tax profit", "net profit"],
  },
  {
    key: "tax-savings",
    label: "Tax Savings",
    unit: "$",
    definition: "Tax avoided because of deductions taken.",
  },
];

const FINANCIAL_TERM_LOOKUP = new Map(
  FINANCIAL_TERMS_INTERNAL.map((term) => [term.key, term]),
);

type FinancialCalculatorInput = {
  term: FinancialTermKey;
  label?: string;
  unit?: string;
  defaultValue: number;
  min: number;
  max: number;
};

export type FinancialCalculatorCopy = {
  key: string;
  pathFragment: string;
  inputs: [FinancialCalculatorInput, FinancialCalculatorInput, FinancialCalculatorInput];
};

export const FINANCIAL_CALCULATOR_COPY: FinancialCalculatorCopy[] = [
  {
    key: "profit-margin",
    pathFragment: "/calculators/business/profit-margin",
    inputs: [
      {
        term: "direct-cost",
        label: "Direct Cost (Job Cost)",
        unit: "$",
        defaultValue: 25000,
        min: 0,
        max: 100_000_000,
      },
      {
        term: "overhead-recovery",
        label: "Overhead Recovery (%)",
        unit: "%",
        defaultValue: 10,
        min: 0,
        max: 60,
      },
      {
        term: "target-profit-margin",
        label: "Target Profit Margin (%)",
        unit: "%",
        defaultValue: 15,
        min: 0,
        max: 60,
      },
    ],
  },
  {
    key: "profit-margin",
    pathFragment: "/calculators/management/margin",
    inputs: [
      {
        term: "direct-cost",
        label: "Direct Cost (Job Cost)",
        unit: "$",
        defaultValue: 25000,
        min: 0,
        max: 100_000_000,
      },
      {
        term: "overhead-recovery",
        label: "Overhead Recovery (%)",
        unit: "%",
        defaultValue: 10,
        min: 0,
        max: 60,
      },
      {
        term: "target-profit-margin",
        label: "Target Profit Margin (%)",
        unit: "%",
        defaultValue: 15,
        min: 0,
        max: 60,
      },
    ],
  },
  {
    key: "labor-rate",
    pathFragment: "/calculators/business/labor-rate",
    inputs: [
      {
        term: "base-wage",
        label: "Base Wage ($/hr)",
        unit: "$/hr",
        defaultValue: 32,
        min: 10,
        max: 500,
      },
      {
        term: "labor-burden",
        label: "Labor Burden (%)",
        unit: "%",
        defaultValue: 28,
        min: 0,
        max: 80,
      },
      {
        term: "overhead-allocation",
        label: "Overhead Allocation (%)",
        unit: "%",
        defaultValue: 12,
        min: 0,
        max: 60,
      },
    ],
  },
  {
    key: "labor-rate",
    pathFragment: "/calculators/management/labor",
    inputs: [
      {
        term: "base-wage",
        label: "Base Wage ($/hr)",
        unit: "$/hr",
        defaultValue: 32,
        min: 10,
        max: 500,
      },
      {
        term: "labor-burden",
        label: "Labor Burden (%)",
        unit: "%",
        defaultValue: 28,
        min: 0,
        max: 80,
      },
      {
        term: "overhead-allocation",
        label: "Overhead Allocation (%)",
        unit: "%",
        defaultValue: 12,
        min: 0,
        max: 60,
      },
    ],
  },
  {
    key: "lead-estimator",
    pathFragment: "/calculators/business/lead-estimator",
    inputs: [
      {
        term: "cost-per-lead",
        label: "Cost per Lead ($)",
        unit: "$",
        defaultValue: 150,
        min: 1,
        max: 100_000,
      },
      {
        term: "close-rate",
        label: "Close Rate (%)",
        unit: "%",
        defaultValue: 25,
        min: 1,
        max: 100,
      },
      {
        term: "average-job-value",
        label: "Average Job Value ($)",
        unit: "$",
        defaultValue: 8500,
        min: 100,
        max: 10_000_000,
      },
    ],
  },
  {
    key: "lead-estimator",
    pathFragment: "/calculators/management/leads",
    inputs: [
      {
        term: "cost-per-lead",
        label: "Cost per Lead ($)",
        unit: "$",
        defaultValue: 150,
        min: 1,
        max: 100_000,
      },
      {
        term: "close-rate",
        label: "Close Rate (%)",
        unit: "%",
        defaultValue: 25,
        min: 1,
        max: 100,
      },
      {
        term: "average-job-value",
        label: "Average Job Value ($)",
        unit: "$",
        defaultValue: 8500,
        min: 100,
        max: 10_000_000,
      },
    ],
  },
  {
    key: "tax-save",
    pathFragment: "/calculators/business/tax-save",
    inputs: [
      {
        term: "gross-revenue",
        label: "Gross Revenue ($)",
        unit: "$",
        defaultValue: 150_000,
        min: 0,
        max: 1_000_000_000,
      },
      {
        term: "blended-tax-rate",
        label: "Blended Tax Rate (%)",
        unit: "%",
        defaultValue: 8.75,
        min: 0,
        max: 100,
      },
      {
        term: "deductions",
        label: "Deductions ($)",
        unit: "$",
        defaultValue: 25_000,
        min: 0,
        max: 1_000_000_000,
      },
    ],
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getFinancialCalculatorCopy(path: string): FinancialCalculatorCopy | null {
  const match = FINANCIAL_CALCULATOR_COPY.find((entry) =>
    path.toLowerCase().includes(entry.pathFragment.toLowerCase()),
  );
  return match ?? null;
}

export function getFinancialTermLabel(key: FinancialTermKey): string {
  return FINANCIAL_TERM_LOOKUP.get(key)?.label ?? key;
}

export function getFinancialTermDefinition(labelOrKey: string): string | undefined {
  const normalized = normalize(labelOrKey);
  const match = FINANCIAL_TERMS_INTERNAL.find((term) => {
    const targets = [
      normalize(term.key),
      normalize(term.label),
      ...(term.aliases ?? []).map((alias) => normalize(alias)),
    ];
    return targets.some((target) => normalized === target || normalized.includes(target));
  });
  return match?.definition;
}

export const FINANCIAL_TERMS = FINANCIAL_TERMS_INTERNAL;
