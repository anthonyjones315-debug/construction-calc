import { describe, expect, it } from "vitest";
import { getDateTimeFormatter, getNumberFormatter } from "@/utils/formatters";

describe("ClientDetailClient formatting utilities", () => {
  it("formats currency totals using cached getNumberFormatter", () => {
    const currencyFormatter = getNumberFormatter();
    expect(currencyFormatter.format(12500)).toBe("12,500");
    expect(currencyFormatter.format(1842.55)).toBe("1,842.55");
  });

  it("formats short estimate update dates using cached getDateTimeFormatter", () => {
    const shortDateFormatter = getDateTimeFormatter();
    const formattedDate = shortDateFormatter.format(new Date("2026-03-10T10:00:00Z"));
    expect(formattedDate).toBeTruthy();
    expect(typeof formattedDate).toBe("string");
  });

  it("formats note timestamps using cached getDateTimeFormatter", () => {
    const noteTimestampFormatter = getDateTimeFormatter({
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const formattedTimestamp = noteTimestampFormatter.format(new Date("2026-03-15T14:30:00Z"));
    expect(formattedTimestamp).toContain("2026");
    expect(formattedTimestamp).toContain("Mar");
  });
});
