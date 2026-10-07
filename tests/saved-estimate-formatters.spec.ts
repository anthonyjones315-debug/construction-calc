import { describe, expect, it } from "vitest";
import { getDateTimeFormatter, getNumberFormatter } from "@/utils/formatters";

describe("Saved Estimate Cached Formatters", () => {
  it("formats USD currency using cached Intl.NumberFormat", () => {
    const formatter = getNumberFormatter({
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    expect(formatter.format(1234.56)).toBe("$1,234.56");
    expect(formatter.format(0)).toBe("$0.00");
    expect(formatter.format(100)).toBe("$100.00");
  });

  it("returns cached formatter instances for identical options", () => {
    const formatter1 = getNumberFormatter({
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const formatter2 = getNumberFormatter({
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    expect(formatter1).toBe(formatter2);
  });

  it("formats dates consistently using cached Intl.DateTimeFormat", () => {
    const dateFormatter = getDateTimeFormatter({
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const testDate = new Date("2026-03-17T12:00:00Z");
    const formatted = dateFormatter.format(testDate);

    expect(formatted).toContain("2026");
    expect(formatted).toContain("Mar");
  });

  it("returns cached DateTimeFormat instances for identical options", () => {
    const df1 = getDateTimeFormatter({
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const df2 = getDateTimeFormatter({
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    expect(df1).toBe(df2);
  });
});
