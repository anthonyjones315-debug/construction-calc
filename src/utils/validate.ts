import { toCents } from "@/utils/money";

export function sanitizeNum(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function safeDiv(
  numerator: number,
  denominator: number,
  fallback = 0,
): number {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return fallback;
  }
  return numerator / denominator;
}

export function safeCeil(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.ceil(value);
}

export function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function validateWaste(value: unknown): number {
  return clamp(sanitizeNum(value, 0), 0, 100);
}

export function cents(value: number): number {
  return toCents(value);
}
