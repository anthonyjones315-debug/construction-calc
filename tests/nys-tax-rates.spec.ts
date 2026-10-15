import { describe, expect, it } from "vitest";
import { getNysCountyRate, NYS_COUNTY_TAX_RATES_MAP } from "@/data/nys-tax-rates";
import { getFinancialTermDefinition, getFinancialTermLabel } from "@/data/financial-terms";

describe("NYS County Tax Rates pre-computed Map and lookup", () => {
  it("pre-computes NYS_COUNTY_TAX_RATES_MAP with all counties", () => {
    expect(NYS_COUNTY_TAX_RATES_MAP.size).toBeGreaterThan(50);
    expect(NYS_COUNTY_TAX_RATES_MAP.get("oneida")?.combinedRate).toBe(8.75);
    expect(NYS_COUNTY_TAX_RATES_MAP.get("madison")?.combinedRate).toBe(8.0);
    expect(NYS_COUNTY_TAX_RATES_MAP.get("herkimer")?.combinedRate).toBe(8.25);
  });

  it("returns county rate with case-insensitivity and whitespace trim", () => {
    const rate1 = getNysCountyRate("  Oneida ");
    expect(rate1).not.toBeNull();
    expect(rate1?.combinedRate).toBe(8.75);

    const rate2 = getNysCountyRate("HERKIMER");
    expect(rate2).not.toBeNull();
    expect(rate2?.combinedRate).toBe(8.25);
  });

  it("returns null for empty or unknown county names", () => {
    expect(getNysCountyRate("   ")).toBeNull();
    expect(getNysCountyRate("NonExistentCounty")).toBeNull();
  });
});

describe("Financial terms lookup", () => {
  it("returns definition by exact key, label, or alias", () => {
    expect(getFinancialTermDefinition("direct-cost")).toContain("variable job costs");
    expect(getFinancialTermDefinition("Direct Cost (Job Cost)")).toContain("variable job costs");
    expect(getFinancialTermDefinition("cogs")).toContain("variable job costs");
  });

  it("returns undefined for empty or unknown term labels", () => {
    expect(getFinancialTermDefinition("")).toBeUndefined();
    expect(getFinancialTermDefinition("random string xyz")).toBeUndefined();
  });

  it("returns label by key", () => {
    expect(getFinancialTermLabel("direct-cost")).toBe("Direct Cost");
    expect(getFinancialTermLabel("target-profit-margin")).toBe("Target Profit Margin");
  });
});
