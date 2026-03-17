/**
 * Convert a percentage to basis points (1/100th of a percent)
 * Uses integer math to avoid floating point errors
 */
export function toBasisPoints(percent: number) {
  if (!Number.isFinite(percent)) return 0;
  // Multiply by 100 and round to nearest integer
  return Math.round(percent * 100);
}

/**
 * Scale an amount in cents by a basis points rate
 * Uses integer math to avoid floating point errors
 */
export function scaleCentsByBasisPoints(cents: number, basisPoints: number) {
  if (!Number.isFinite(cents) || !Number.isFinite(basisPoints)) return 0;
  // Use integer division with half-up rounding
  const product = BigInt(Math.round(cents)) * BigInt(basisPoints);
  const halfDivisor = BigInt(5000);
  const divisor = BigInt(10000);
  return Number((product + halfDivisor) / divisor);
}

/**
 * Divide an amount in cents by a basis points rate
 * Uses integer math to avoid floating point errors
 */
export function divideCentsByBasisPoints(cents: number, basisPoints: number) {
  if (
    !Number.isFinite(cents) ||
    !Number.isFinite(basisPoints) ||
    basisPoints <= 0
  ) {
    return 0;
  }
  // Use integer multiplication and division with half-up rounding
  const product = BigInt(Math.round(cents)) * BigInt(10000);
  const halfDivisor = BigInt(basisPoints) / BigInt(2);
  return Number((product + halfDivisor) / BigInt(basisPoints));
}
