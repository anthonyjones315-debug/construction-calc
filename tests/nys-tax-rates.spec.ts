import { describe, expect, it } from "vitest";
import { getNysCountyRate } from "@/data/nys-tax-rates";
import { getFinancialTermDefinition } from "@/data/financial-terms";

describe("getNysCountyRate", () => {
  it("returns county tax rate object for valid county name regardless of case and trimming", () => {
    const oneida = getNysCountyRate("  Oneida  ");
    expect(oneida).not.toBeNull();
    expect(oneida?.county).toBe("Oneida");
    expect(oneida?.combinedRate).toBe(8.75);

    const albany = getNysCountyRate("albany");
    expect(albany).not.toBeNull();
    expect(albany?.county).toBe("Albany");
    expect(albany?.combinedRate).toBe(8.0);
  });

  it("returns null for unknown or empty county string", () => {
    expect(getNysCountyRate("")).toBeNull();
    expect(getNysCountyRate("   ")).toBeNull();
    expect(getNysCountyRate("NonExistentCounty")).toBeNull();
  });
});

describe("getFinancialTermDefinition", () => {
  it("returns definition by key, label, or alias", () => {
    const directCostDef = getFinancialTermDefinition("direct-cost");
    expect(directCostDef).toMatch(/variable job costs/i);

    const cogsAliasDef = getFinancialTermDefinition("cogs");
    expect(cogsAliasDef).toBe(directCostDef);

    const labelDef = getFinancialTermDefinition("Direct Cost");
    expect(labelDef).toBe(directCostDef);
  });

  it("returns undefined for unrecognized terms", () => {
    expect(getFinancialTermDefinition("invalid-term-12345")).toBeUndefined();
  });
});
