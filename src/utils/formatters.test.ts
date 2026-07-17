import { describe, expect, test } from "vitest";
import {
  USD_FORMATTER,
  USD_FORMATTER_COMPACT,
  DATE_FORMATTER_FULL,
  DATE_FORMATTER_SHORT_DATE,
  DATE_FORMATTER_WITH_WEEKDAY,
  DATE_TIME_FORMATTER,
} from "./formatters";

describe("Centralized Formatters Performance Cache", () => {
  describe("Currency Formatters", () => {
    test("USD_FORMATTER formats currency with cents correctly", () => {
      expect(USD_FORMATTER.format(1234.56)).toBe("$1,234.56");
      expect(USD_FORMATTER.format(0)).toBe("$0.00");
      expect(USD_FORMATTER.format(-50.5)).toBe("-$50.50");
    });

    test("USD_FORMATTER_COMPACT formats currency without cents (rounding as needed)", () => {
      expect(USD_FORMATTER_COMPACT.format(1234.56)).toBe("$1,235");
      expect(USD_FORMATTER_COMPACT.format(1234.49)).toBe("$1,234");
      expect(USD_FORMATTER_COMPACT.format(0)).toBe("$0");
      expect(USD_FORMATTER_COMPACT.format(-50.5)).toBe("-$51");
    });
  });

  describe("Date/Time Formatters", () => {
    // We use a fixed date: 2026-03-17 14:35:00 UTC (Tuesday)
    // Note: Since timezone of the runner might vary, we can test parts of formatting
    // or format components in a robust, timezone-tolerant manner.
    const testDate = new Date(Date.UTC(2026, 2, 17, 14, 35, 0));

    test("DATE_FORMATTER_FULL formats full date", () => {
      const formatted = DATE_FORMATTER_FULL.format(testDate);
      expect(formatted).toContain("2026");
      expect(formatted).toContain("Mar");
      expect(formatted).toContain("17");
    });

    test("DATE_FORMATTER_SHORT_DATE formats short date (no year)", () => {
      const formatted = DATE_FORMATTER_SHORT_DATE.format(testDate);
      expect(formatted).not.toContain("2026");
      expect(formatted).toContain("Mar");
      expect(formatted).toContain("17");
    });

    test("DATE_FORMATTER_WITH_WEEKDAY formats date with weekday", () => {
      const formatted = DATE_FORMATTER_WITH_WEEKDAY.format(testDate);
      // Depending on runner timezone, March 17 14:35 UTC could be Tuesday or Monday in some timezones.
      // So we can assert that it contains either "Monday" or "Tuesday", and "Mar", "17".
      expect(formatted).toMatch(/(Monday|Tuesday)/);
      expect(formatted).toContain("Mar");
      expect(formatted).toContain("17");
    });

    test("DATE_TIME_FORMATTER formats date and time", () => {
      const formatted = DATE_TIME_FORMATTER.format(testDate);
      expect(formatted).toContain("2026");
      expect(formatted).toContain("Mar");
      expect(formatted).toContain("17");
      // Time should be formatted as 2-digit hour/minute
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });
});
