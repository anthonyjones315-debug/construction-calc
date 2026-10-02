import { describe, expect, it } from "vitest";
import { getDateTimeFormatter, getNumberFormatter } from "@/utils/formatters";

describe("Cached formatters in estimate detail components", () => {
  it("formats currency using getNumberFormatter consistently", () => {
    const formatter = getNumberFormatter({
      style: "currency",
      currency: "USD",
    });

    const result1 = formatter.format(1234.56);
    const result2 = formatter.format(1234.56);

    expect(result1).toBe("$1,234.56");
    expect(result2).toBe("$1,234.56");
    expect(getNumberFormatter({ style: "currency", currency: "USD" })).toBe(formatter);
  });

  it("formats dates using getDateTimeFormatter consistently", () => {
    const formatter = getDateTimeFormatter({
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const testDate = new Date("2026-03-17T12:00:00Z");
    const formatted = formatter.format(testDate);

    expect(formatted).toContain("2026");
    expect(formatted).toContain("Mar");
    expect(getDateTimeFormatter({ year: "numeric", month: "short", day: "numeric" })).toBe(formatter);
  });
});
