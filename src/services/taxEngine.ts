import { getNysCountyRate, NYS_STATE_SALES_TAX_RATE } from "@/data/nys-tax-rates";
import { centsToDollars, toCents } from "@/utils/money";

export type ProjectTaxCategory = "capital-improvement" | "repair-maintenance";

export type TaxEngineInput = {
  county: string;
  taxableAmount: number;
  projectType: ProjectTaxCategory;
  /**
   * Optional custom combined rate (%) used when county is outside NYS table
   * or when a blended override is required.
   */
  customCombinedRate?: number;
};

export type TaxEngineResult = {
  county: string;
  rateApplied: number;
  statePortion: number;
  localPortion: number;
  taxDue: number;
  projectType: ProjectTaxCategory;
  requiresST124: boolean;
  notes: string[];
};

const toBasisPoints = (ratePercent: number) =>
  Number((ratePercent * 100).toFixed(0));

/**
 * Calculates NYS sales tax for construction jobs with capital improvement handling.
 *
 * - Capital Improvements (NYS Form ST-124) => no sales tax billed to customer.
 * - Repairs/Maintenance => standard combined state + local rate.
 * - Oneida County combined rate is 8.75% (validated against NYS references).
 */
export function calculateNysSalesTax(input: TaxEngineInput): TaxEngineResult {
  const notes: string[] = [];
  const taxableAmount = Math.max(0, input.taxableAmount);
  const taxableCents = toCents(taxableAmount);
  const isCapital = input.projectType === "capital-improvement";

  const countyRate =
    getNysCountyRate(input.county)?.combinedRate ?? input.customCombinedRate ?? 0;

  const rateApplied = isCapital ? 0 : countyRate;
  const stateRate = isCapital ? 0 : NYS_STATE_SALES_TAX_RATE;
  const localRate = Math.max(rateApplied - stateRate, 0);

  const stateBasisPoints = isCapital ? 0 : toBasisPoints(stateRate);
  const localBasisPoints = isCapital
    ? 0
    : Math.max(toBasisPoints(localRate), 0);

  const statePortionCents = isCapital
    ? 0
    : Number(((taxableCents * stateBasisPoints) / 10_000).toFixed(0));
  const localPortionCents = isCapital
    ? 0
    : Number(((taxableCents * localBasisPoints) / 10_000).toFixed(0));
  const taxDueCents = isCapital ? 0 : statePortionCents + localPortionCents;

  const statePortion = centsToDollars(statePortionCents);
  const localPortion = centsToDollars(localPortionCents);
  const taxDue = centsToDollars(taxDueCents);

  if (isCapital) {
    notes.push("Capital Improvement: obtain and retain NYS Form ST-124; do not charge sales tax to the customer.");
  } else {
    if (!countyRate) {
      notes.push("No county rate found; verify blended tax rate before invoicing.");
    }
    const countyLower = input.county.toLowerCase();
    if (countyLower === "oneida") {
      notes.push("Oneida County combined rate 8.75% applied (state 4.0% + local 4.75%).");
    } else if (countyLower === "herkimer") {
      notes.push("Herkimer County combined rate 8.25% applied (state 4.0% + local 4.25%).");
    } else if (countyLower === "madison") {
      notes.push("Madison County combined rate 8.00% applied (state 4.0% + local 4.0%).");
    }
  }

  return {
    county: input.county,
    rateApplied,
    statePortion,
    localPortion,
    taxDue,
    projectType: input.projectType,
    requiresST124: isCapital,
    notes,
  };
}
