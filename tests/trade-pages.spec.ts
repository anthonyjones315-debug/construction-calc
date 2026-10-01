import { describe, expect, it } from "vitest";
import { getTradeCalculators } from "@/app/calculators/_lib/trade-pages";

describe("getTradeCalculators", () => {
  it("returns calculators for concrete category in preferred order", () => {
    const concreteCalcs = getTradeCalculators("concrete");
    expect(concreteCalcs.length).toBeGreaterThan(0);
    expect(concreteCalcs.every((c) => c.category === "concrete" && c.type === "calculator")).toBe(true);

    const paths = concreteCalcs.map((c) => c.canonicalPath);
    expect(paths).toContain("/calculators/concrete/slab");
    expect(paths).toContain("/calculators/concrete/footing");
    expect(paths).toContain("/calculators/concrete/block-wall");
    // Slab should precede footing based on categoryLinks preferred order
    expect(paths.indexOf("/calculators/concrete/slab")).toBeLessThan(
      paths.indexOf("/calculators/concrete/footing"),
    );
  });

  it("returns calculators for framing category in preferred order", () => {
    const framingCalcs = getTradeCalculators("framing");
    expect(framingCalcs.length).toBeGreaterThan(0);
    expect(framingCalcs.every((c) => c.category === "framing" && c.type === "calculator")).toBe(true);

    const paths = framingCalcs.map((c) => c.canonicalPath);
    expect(paths).toContain("/calculators/framing/wall-studs");
    expect(paths).toContain("/calculators/framing/floor");
  });

  it("returns empty array for invalid/unknown category", () => {
    // @ts-expect-error - testing invalid category fallback
    const result = getTradeCalculators("nonexistent");
    expect(result).toEqual([]);
  });
});
