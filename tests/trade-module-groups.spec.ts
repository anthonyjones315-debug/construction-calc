import { describe, expect, it } from "vitest";
import {
  PRECOMPUTED_TRADE_MODULE_GROUPS,
  filterTradeModuleGroups,
} from "@/app/calculators/_lib/trade-module-groups";

describe("filterTradeModuleGroups", () => {
  it("returns all trade module groups unchanged when normalizedSearch is empty", () => {
    const result = filterTradeModuleGroups(PRECOMPUTED_TRADE_MODULE_GROUPS, "");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].modules.length).toBeGreaterThan(0);
  });

  it("filters modules matching a specific search term like 'shingles'", () => {
    const result = filterTradeModuleGroups(PRECOMPUTED_TRADE_MODULE_GROUPS, "shingles");
    expect(result.length).toBe(1);
    expect(result[0].label).toBe("Roofing");
    expect(result[0].modules.some((m) => m.label.toLowerCase().includes("shingles"))).toBe(true);
  });

  it("filters modules matching a group label like 'concrete'", () => {
    const result = filterTradeModuleGroups(PRECOMPUTED_TRADE_MODULE_GROUPS, "concrete");
    expect(result.length).toBeGreaterThan(0);
    const concreteGroup = result.find((g) => g.label === "Concrete");
    expect(concreteGroup).toBeDefined();
    expect(concreteGroup!.modules.length).toBeGreaterThan(0);
  });

  it("returns empty array when search query matches no module or group", () => {
    const result = filterTradeModuleGroups(
      PRECOMPUTED_TRADE_MODULE_GROUPS,
      "nonexistenttradequery123",
    );
    expect(result).toEqual([]);
  });
});
