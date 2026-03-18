import { scaleCentsByBasisPoints } from "@/utils/rates";
import { toCents } from "@/utils/money";

export const ONEIDA_BASIS_POINTS = 875;
export const HERKIMER_BASIS_POINTS = 825;
export const MADISON_BASIS_POINTS = 800;

export const COUNTY_BASIS_POINTS = {
  oneida: ONEIDA_BASIS_POINTS,
  herkimer: HERKIMER_BASIS_POINTS,
  madison: MADISON_BASIS_POINTS,
} as const;

type MaybeRecord = Record<string, unknown> | null | undefined;

export type VerifiedCalculationColumns = {
  subtotal_cents: number | null;
  tax_cents: number | null;
  total_cents: number | null;
  tax_basis_points: number | null;
  verified_county: string | null;
  verification_status: "unverified" | "verified" | "corrected";
  correctedData?: {
    subtotal_cents: number | null;
    tax_cents: number | null;
    total_cents: number | null;
    tax_basis_points: number | null;
    verified_county: string | null;
  };
};

export type VerifyEstimateInput = {
  inputs?: MaybeRecord;
  subtotal_cents?: number | null;
  tax_cents?: number | null;
  total_cents?: number | null;
  total_cost?: number | null;
  county?: string | null;
  custom_basis_points?: number | null;
};

function calculateTaxCents(subtotalCents: number, basisPoints: number) {
  return scaleCentsByBasisPoints(subtotalCents, basisPoints);
}

function readNumberish(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  }

  return null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getInputValue(inputs: MaybeRecord, ...keys: string[]) {
  if (!inputs) return undefined;

  for (const key of keys) {
    if (key in inputs) {
      return inputs[key];
    }
  }

  return undefined;
}

export function resolveCountyBasisPoints(
  county: string | null | undefined,
  customBasisPoints?: number | null,
) {
  if (Number.isFinite(customBasisPoints)) {
    return Math.max(0, Math.trunc(customBasisPoints ?? 0));
  }

  const normalized = county?.trim().toLowerCase() ?? "";
  return COUNTY_BASIS_POINTS[
    normalized as keyof typeof COUNTY_BASIS_POINTS
  ] ?? null;
}

export function isCheckViolation(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "23514" ||
    maybeError.message?.toLowerCase().includes("check constraint") === true
  );
}

export function verifyEstimate(
  input: VerifyEstimateInput,
): VerifiedCalculationColumns {
  const inputs = input.inputs;
  const verifiedCounty =
    input.county ??
    readString(
      getInputValue(inputs, "verified_county", "selected_county", "tax_county"),
    );

  const subtotalCents =
    input.subtotal_cents ??
    readNumberish(getInputValue(inputs, "subtotal_cents", "subtotalCents"));
  const inputTaxCents =
    input.tax_cents ??
    readNumberish(getInputValue(inputs, "tax_cents", "taxCents"));
  const totalCents =
    input.total_cents ??
    readNumberish(getInputValue(inputs, "total_cents", "totalCents")) ??
    (typeof input.total_cost === "number" ? toCents(input.total_cost) : null);
  const taxBasisPoints = resolveCountyBasisPoints(
    verifiedCounty,
    input.custom_basis_points ??
      readNumberish(
        getInputValue(inputs, "custom_basis_points", "tax_basis_points"),
      ),
  );

  let correctedSubtotal = subtotalCents;
  let correctedTax = inputTaxCents;
  let correctedTotal = totalCents;

  if (correctedSubtotal !== null && taxBasisPoints !== null) {
    correctedTax = calculateTaxCents(correctedSubtotal, taxBasisPoints);
    correctedTotal = correctedSubtotal + correctedTax;
  } else if (correctedSubtotal !== null && correctedTax !== null) {
    correctedTotal = correctedSubtotal + correctedTax;
  } else if (
    correctedSubtotal === null &&
    correctedTotal !== null &&
    correctedTax !== null
  ) {
    correctedSubtotal = correctedTotal - correctedTax;
  }

  const wasCorrected =
    correctedSubtotal !== subtotalCents ||
    correctedTax !== inputTaxCents ||
    correctedTotal !== totalCents;

  if (
    correctedSubtotal === null ||
    correctedTax === null ||
    correctedTotal === null
  ) {
    return {
      subtotal_cents: correctedSubtotal,
      tax_cents: correctedTax,
      total_cents: correctedTotal,
      tax_basis_points: taxBasisPoints,
      verified_county: verifiedCounty ?? null,
      verification_status: "unverified",
    };
  }

  return {
    subtotal_cents: correctedSubtotal,
    tax_cents: correctedTax,
    total_cents: correctedTotal,
    tax_basis_points: taxBasisPoints,
    verified_county: verifiedCounty ?? null,
    verification_status: wasCorrected ? "corrected" : "verified",
    correctedData: wasCorrected
      ? {
          subtotal_cents: correctedSubtotal,
          tax_cents: correctedTax,
          total_cents: correctedTotal,
          tax_basis_points: taxBasisPoints,
          verified_county: verifiedCounty ?? null,
        }
      : undefined,
  };
}

export async function saveCalculation(
  db: {
    from: (table: string) => {
      insert: (
        payload: Record<string, unknown>,
      ) => {
        select: (
          selection: string,
        ) => {
          single: () => PromiseLike<{
            data: { id: string } | null;
            error: { code?: string; message: string } | null;
          }>;
        };
      };
    };
  },
  insertPayload: Record<string, unknown>,
  verificationInput: VerifyEstimateInput,
) {
  const verified = verifyEstimate(verificationInput);
  const payloadWithVerification = {
    ...insertPayload,
    ...verified,
  };

  const firstAttempt = await db
    .from("saved_estimates")
    .insert(payloadWithVerification)
    .select("id")
    .single();

  if (!firstAttempt.error || !isCheckViolation(firstAttempt.error)) {
    return {
      ...firstAttempt,
      correctedData: verified.correctedData,
    };
  }

  const healed = verifyEstimate({
    ...verificationInput,
    ...verified.correctedData,
  });

  const secondAttempt = await db
    .from("saved_estimates")
    .insert({
      ...insertPayload,
      ...healed,
    })
    .select("id")
    .single();

  return {
    ...secondAttempt,
    correctedData: healed.correctedData,
  };
}
