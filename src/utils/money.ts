function toDecimalString(value: number): string {
  const absolute = Math.abs(value);
  const raw = absolute.toString();
  if (!/[eE]/.test(raw)) return raw;

  return absolute
    .toFixed(20)
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.0+$/, "")
    .replace(/\.$/, "");
}

function parseFiniteDecimal(value: number): {
  sign: 1 | -1;
  digits: bigint;
  scale: number;
} | null {
  if (!Number.isFinite(value)) return null;

  const sign: 1 | -1 = value < 0 ? -1 : 1;
  const normalized = toDecimalString(value);
  const [wholePart = "0", fractionalPart = ""] = normalized
    .replace(/^-/, "")
    .split(".");
  const digits = `${wholePart}${fractionalPart}`.replace(/^0+(?=\d)/, "") || "0";

  return {
    sign,
    digits: BigInt(digits),
    scale: fractionalPart.length,
  };
}

function roundScaledInteger(
  digits: bigint,
  currentScale: number,
  targetScale: number,
): bigint {
  if (currentScale === targetScale) return digits;

  if (currentScale < targetScale) {
    return digits * 10n ** BigInt(targetScale - currentScale);
  }

  const divisor = 10n ** BigInt(currentScale - targetScale);
  const quotient = digits / divisor;
  const remainder = digits % divisor;

  return quotient + (remainder * 2n >= divisor ? 1n : 0n);
}

/**
 * Convert a dollar amount to integer cents without exposing float rounding
 * errors from values such as 1.005 or 10.075.
 */
export function toCents(amount: number): number {
  const parsed = parseFiniteDecimal(amount);
  if (!parsed) return 0;

  const cents = roundScaledInteger(parsed.digits, parsed.scale, 2);
  return parsed.sign < 0 ? -Number(cents) : Number(cents);
}

/**
 * Multiply an integer unit cost in cents by a (possibly fractional) quantity
 * and return integer cents with safe rounding.
 */
export function multiplyCents(unitCostCents: number, quantity: number): number {
  if (!Number.isFinite(unitCostCents) || !Number.isFinite(quantity)) return 0;

  const parsedQuantity = parseFiniteDecimal(quantity);
  if (!parsedQuantity) return 0;

  const normalizedUnitCostCents = Math.trunc(unitCostCents);
  const product =
    BigInt(Math.abs(normalizedUnitCostCents)) * parsedQuantity.digits;
  const roundedCents = roundScaledInteger(product, parsedQuantity.scale, 0);
  const sign = normalizedUnitCostCents < 0 ? -parsedQuantity.sign : parsedQuantity.sign;

  return sign < 0 ? -Number(roundedCents) : Number(roundedCents);
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

export function normalizeDollars(amount: number): number {
  return centsToDollars(toCents(amount));
}

export function multiplyDollars(unitCost: number, quantity: number): number {
  return centsToDollars(multiplyCents(toCents(unitCost), quantity));
}

export function sumDollars(values: number[]): number {
  return centsToDollars(sumCents(values.map((value) => toCents(value))));
}
