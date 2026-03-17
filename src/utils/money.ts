/**
 * Convert a dollar amount to integer cents using toFixed to avoid floating
 * point drift (e.g., 18.333 * 157.55 => 288836 cents => $2,888.36).
 */
export function toCents(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Number((amount * 100).toFixed(0));
}

/**
 * Multiply an integer unit cost in cents by a (possibly fractional) quantity
 * and return integer cents with safe rounding.
 */
export function multiplyCents(unitCostCents: number, quantity: number): number {
  if (!Number.isFinite(unitCostCents) || !Number.isFinite(quantity)) return 0;
  return Number((unitCostCents * quantity).toFixed(0));
}

/**
 * Convert integer cents back to a dollar amount rounded to 2 decimals.
 */
export function centsToDollars(cents: number): number {
  if (!Number.isFinite(cents)) return 0;
  return Number((cents / 100).toFixed(2));
}

/**
 * Add integer cents values without losing precision.
 */
export function sumCents(values: number[]): number {
  return values.reduce((sum, value) => sum + (Number.isFinite(value) ? Math.trunc(value) : 0), 0);
}
