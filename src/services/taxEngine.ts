import {
  getNysCountyRate,
  NYS_STATE_SALES_TAX_RATE,
} from "@/data/nys-tax-rates";
import { centsToDollars, toCents } from "@/utils/money";
import { scaleCentsByBasisPoints, toBasisPoints } from "@/utils/rates";

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
  const taxableCents = toCents(taxableAmount); // Convert to integer cents
  const isCapital = input.projectType === "capital-improvement";

  // Get county rate with fallback to custom or 0
  const countyRate =
    getNysCountyRate(input.county)?.combinedRate ??
    input.customCombinedRate ??
    0;

  // Apply rates based on project type
  const rateApplied = isCapital ? 0 : countyRate;
  const stateRate = isCapital ? 0 : NYS_STATE_SALES_TAX_RATE;
  const localRate = Math.max(rateApplied - stateRate, 0);

  // Convert rates to basis points for integer math
  const stateBasisPoints = isCapital ? 0 : toBasisPoints(stateRate);
  const localBasisPoints = isCapital
    ? 0
    : Math.max(toBasisPoints(localRate), 0);

  // Calculate tax portions in integer cents
  const statePortionCents = isCapital
    ? 0
    : scaleCentsByBasisPoints(taxableCents, stateBasisPoints);
  const localPortionCents = isCapital
    ? 0
    : scaleCentsByBasisPoints(taxableCents, localBasisPoints);

  // Sum total tax in cents and round using half-up logic
  const taxDueCents = isCapital ? 0 : statePortionCents + localPortionCents;

  // Convert back to dollars with 2 decimal places
  const statePortion = centsToDollars(statePortionCents);
  const localPortion = centsToDollars(localPortionCents);
  const taxDue = centsToDollars(taxDueCents);

  if (isCapital) {
    notes.push(
      "Capital Improvement: obtain and retain NYS Form ST-124; do not charge sales tax to the customer.",
    );
  } else {
    if (!countyRate) {
      notes.push(
        "No county rate found; verify blended tax rate before invoicing.",
      );
    }
    const countyLower = input.county.toLowerCase();
    if (countyLower === "oneida") {
      notes.push(
        "Oneida County combined rate 8.75% applied (state 4.0% + local 4.75%).",
      );
    } else if (countyLower === "herkimer") {
      notes.push(
        "Herkimer County combined rate 8.25% applied (state 4.0% + local 4.25%).",
      );
    } else if (countyLower === "madison") {
      notes.push(
        "Madison County combined rate 8.00% applied (state 4.0% + local 4.0%).",
      );
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
