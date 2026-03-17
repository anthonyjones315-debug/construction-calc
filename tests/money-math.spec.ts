import { describe, expect, it } from "vitest";
import {
  centsToDollars,
  multiplyCents,
  multiplyDollars,
  normalizeDollars,
  sumDollars,
  toCents,
} from "@/utils/money";

describe("money math", () => {
  it("keeps 18.333 yards @ $157.55 exact to $2,888.36", () => {
    const unitCostCents = toCents(157.55);
    const totalCents = multiplyCents(unitCostCents, 18.333);
    expect(centsToDollars(totalCents)).toBe(2888.36);
  });

  it("rounds half-cent dollar values correctly before converting to cents", () => {
    expect(toCents(1.005)).toBe(101);
    expect(toCents(2.335)).toBe(234);
    expect(toCents(10.075)).toBe(1008);
  });

  it("keeps invoice-style line totals exact when quantity introduces binary drift", () => {
    expect(multiplyCents(100, 10.075)).toBe(1008);
    expect(multiplyDollars(157.55, 18.333)).toBe(2888.36);
  });

  it("applies a negative sign when unit cost cents are negative and quantity is positive", () => {
    const result = multiplyCents(-15755, 18.333);

    expect(result).toBe(-288836);
    expect(Math.sign(result)).toBe(-1);
    expect(Math.abs(result)).toBe(288836);
  });

  it("applies a negative sign when unit cost cents are positive and quantity is negative", () => {
    const result = multiplyCents(15755, -18.333);

    expect(result).toBe(-288836);
    expect(Math.sign(result)).toBe(-1);
    expect(Math.abs(result)).toBe(288836);
  });

  it("returns a positive rounded result when both unit cost cents and quantity are negative", () => {
    const result = multiplyCents(-100, -10.075);

    expect(result).toBe(1008);
    expect(Math.sign(result)).toBe(1);
    expect(Math.abs(result)).toBe(1008);
  });

  it("keeps zero magnitude when multiplying by zero, even with a negative unit cost", () => {
    const result = multiplyCents(-15755, 0);

    expect(Object.is(result, -0)).toBe(true);
    expect(Object.is(Math.sign(result), -0)).toBe(true);
    expect(Math.abs(result)).toBe(0);
  });

  it("normalizes and sums dollar amounts through cents", () => {
    expect(normalizeDollars(12.345)).toBe(12.35);
    expect(sumDollars([0.1, 0.2, 10.075])).toBe(10.38);
  });
});
