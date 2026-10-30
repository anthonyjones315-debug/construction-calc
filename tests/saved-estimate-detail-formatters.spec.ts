import { describe, it, expect } from "vitest";
import { getDateTimeFormatter } from "@/utils/formatters";

describe("Saved EstimateDetail formatters", () => {
  it("caches date formatters for medium and long date formats used in EstimateDetail", () => {
    const mediumOptions = {
      year: "numeric" as const,
      month: "short" as const,
      day: "numeric" as const,
    };
    const longOptions = {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    };

    const mediumFmt1 = getDateTimeFormatter(mediumOptions, "en-US");
    const mediumFmt2 = getDateTimeFormatter(mediumOptions, "en-US");
    expect(mediumFmt1).toBe(mediumFmt2);

    const longFmt1 = getDateTimeFormatter(longOptions, "en-US");
    const longFmt2 = getDateTimeFormatter(longOptions, "en-US");
    expect(longFmt1).toBe(longFmt2);

    const testDate = new Date("2026-03-25T12:00:00Z");
    expect(mediumFmt1.format(testDate)).toContain("2026");
    expect(longFmt1.format(testDate)).toContain("March");
  });
});
