import { describe, expect, it } from "vitest";
import {
  getNysCountyRate,
  NYS_COUNTY_TAX_RATES,
  NYS_COUNTY_TAX_RATES_MAP,
} from "@/data/nys-tax-rates";
import { getFinancialTermDefinition } from "@/data/financial-terms";

describe("NYS County Tax Rates pre-computed Map lookup", () => {
  it("populates NYS_COUNTY_TAX_RATES_MAP with all county entries", () => {
    expect(NYS_COUNTY_TAX_RATES_MAP.size).toBe(NYS_COUNTY_TAX_RATES.length);
    expect(NYS_COUNTY_TAX_RATES_MAP.get("oneida")?.combinedRate).toBe(8.75);
    expect(NYS_COUNTY_TAX_RATES_MAP.get("madison")?.combinedRate).toBe(8.0);
    expect(NYS_COUNTY_TAX_RATES_MAP.get("herkimer")?.combinedRate).toBe(8.25);
  });

  it("retrieves county tax rates accurately regardless of case or whitespace", () => {
    expect(getNysCountyRate("Oneida")?.combinedRate).toBe(8.75);
    expect(getNysCountyRate("   oneida  ")?.combinedRate).toBe(8.75);
    expect(getNysCountyRate("HERKIMER")?.combinedRate).toBe(8.25);
    expect(getNysCountyRate("madison")?.combinedRate).toBe(8.0);
  });

  it("returns null for empty or invalid county names", () => {
    expect(getNysCountyRate("")).toBeNull();
    expect(getNysCountyRate("   ")).toBeNull();
    expect(getNysCountyRate("NonExistentCounty")).toBeNull();
  });
});

describe("Financial Terms pre-computed normalized definitions", () => {
  it("resolves definitions by key, label, and alias", () => {
    expect(getFinancialTermDefinition("direct-cost")).toContain("variable job costs");
    expect(getFinancialTermDefinition("Direct Cost")).toContain("variable job costs");
    expect(getFinancialTermDefinition("cogs")).toContain("variable job costs");
    expect(getFinancialTermDefinition("job cost")).toContain("variable job costs");
  });

  it("returns undefined for unknown terms", () => {
    expect(getFinancialTermDefinition("unknown-term-xyz")).toBeUndefined();
  });
});
