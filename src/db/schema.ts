export const SAVED_ESTIMATE_CHECK_CONSTRAINT =
  "(total_cents = subtotal_cents + tax_cents)";

export const SAVED_ESTIMATE_RLS_POLICY =
  'create policy "Users can only see their own estimates" on public.saved_estimates for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)';

export type IntegerCurrency = number;
export type IntegerDimension = number;

export type SavedEstimateIntegrityRow = {
  id: string;
  subtotal_cents: IntegerCurrency | null;
  tax_cents: IntegerCurrency | null;
  total_cents: IntegerCurrency | null;
  tax_basis_points: number | null;
  verified_county: string | null;
  verification_status: "unverified" | "verified" | "corrected";
};

export type StructuredCalculationRow = SavedEstimateIntegrityRow & {
  width_milli_inches: IntegerDimension | null;
  length_milli_inches: IntegerDimension | null;
  depth_milli_inches: IntegerDimension | null;
};
