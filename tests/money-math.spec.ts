import { describe, expect, it } from "vitest";
import { centsToDollars, multiplyCents, toCents } from "@/utils/money";

describe("money math", () => {
  it("keeps 18.333 yards @ $157.55 exact to $2,888.36", () => {
    const unitCostCents = toCents(157.55);
    const totalCents = multiplyCents(unitCostCents, 18.333);
    expect(centsToDollars(totalCents)).toBe(2888.36);
  });
});
