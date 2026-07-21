import { describe, it, expect, vi } from "vitest";
import {
  getCacheKey,
  getNumberFormatter,
  getDateTimeFormatter,
  USD_FORMATTER,
  USD_FORMATTER_COMPACT,
  DATE_FORMATTER_FULL,
  DATE_FORMATTER_WITH_WEEKDAY,
  DATE_FORMATTER_SHORT_DATE,
  DATE_TIME_FORMATTER,
} from "./formatters";

describe("formatters utils", () => {
  describe("getCacheKey", () => {
    it("returns locale when no options are provided", () => {
      expect(getCacheKey("en-US", {})).toBe("en-US");
    });

    it("generates deterministic keys with sorted options", () => {
      const options1 = { style: "currency", currency: "USD" };
      const options2 = { currency: "USD", style: "currency" };

      const key1 = getCacheKey("en-US", options1);
      const key2 = getCacheKey("en-US", options2);

      expect(key1).toBe("en-US|currency:USD|style:currency"); // sorted alphabetically by key: currency, style
      expect(key1).toBe(key2);
    });
  });

  describe("getNumberFormatter", () => {
    it("returns a cached NumberFormat instance", () => {
      const options = { style: "currency", currency: "USD" };
      const formatter1 = getNumberFormatter(options);
      const formatter2 = getNumberFormatter(options);

      expect(formatter1).toBe(formatter2);
    });

    it("formats numbers correctly as USD", () => {
      const formatter = getNumberFormatter({ style: "currency", currency: "USD" });
      expect(formatter.format(1234.56)).toBe("$1,234.56");
    });
  });

  describe("getDateTimeFormatter", () => {
    it("returns a cached DateTimeFormat instance", () => {
      const options = { year: "numeric" as const, month: "long" as const };
      const formatter1 = getDateTimeFormatter(options);
      const formatter2 = getDateTimeFormatter(options);

      expect(formatter1).toBe(formatter2);
    });

    it("formats dates correctly", () => {
      const date = new Date("2026-03-17T12:00:00Z");
      const formatter = getDateTimeFormatter({
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
      expect(formatter.format(date)).toBe("Mar 17, 2026");
    });
  });

  describe("Pre-defined formatters", () => {
    it("USD_FORMATTER formats currency with cents", () => {
      expect(USD_FORMATTER.format(100.5)).toBe("$100.50");
    });

    it("USD_FORMATTER_COMPACT formats currency without cents", () => {
      expect(USD_FORMATTER_COMPACT.format(100.5)).toBe("$101");
    });

    it("DATE_FORMATTER_FULL formats date fully", () => {
      const date = new Date("2026-03-17T00:00:00Z");
      const formatted = DATE_FORMATTER_FULL.format(date);
      expect(formatted).toContain("2026");
      expect(formatted).toContain("March");
    });

    it("DATE_FORMATTER_WITH_WEEKDAY formats date with weekday", () => {
      const date = new Date("2026-03-17T00:00:00Z"); // March 17, 2026 is Tuesday
      const formatted = DATE_FORMATTER_WITH_WEEKDAY.format(date);
      expect(formatted).toContain("Tuesday");
    });

    it("DATE_FORMATTER_SHORT_DATE formats date in short format", () => {
      const date = new Date("2026-03-17T00:00:00Z");
      const formatted = DATE_FORMATTER_SHORT_DATE.format(date);
      expect(formatted).toContain("Mar 17, 2026");
    });

    it("DATE_TIME_FORMATTER formats date and time correctly", () => {
      const date = new Date("2026-03-17T12:00:00Z");
      const formatted = DATE_TIME_FORMATTER.format(date);
      expect(formatted).toContain("Mar 17, 2026");
    });
  });
});
