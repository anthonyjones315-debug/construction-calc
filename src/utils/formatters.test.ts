import { describe, it, expect } from "vitest";
import {
  getNumberFormatter,
  getDateTimeFormatter,
  getCacheKey,
  USD_FORMATTER,
  DATE_FORMATTER_FULL,
} from "./formatters";

describe("formatters", () => {
  describe("getCacheKey", () => {
    it("generates deterministic keys regardless of option order", () => {
      const key1 = getCacheKey("en-US", { month: "short", day: "numeric" });
      const key2 = getCacheKey("en-US", { day: "numeric", month: "short" });
      expect(key1).toBe(key2);
    });

    it("includes locale in the key", () => {
      const keyUS = getCacheKey("en-US", { month: "short" });
      const keyGB = getCacheKey("en-GB", { month: "short" });
      expect(keyUS).not.toBe(keyGB);
    });
  });

  describe("getNumberFormatter", () => {
    it("returns the same instance for identical options", () => {
      const options = { style: "currency", currency: "USD" } as const;
      const formatter1 = getNumberFormatter(options);
      const formatter2 = getNumberFormatter(options);
      expect(formatter1).toBe(formatter2);
    });

    it("returns different instances for different options", () => {
      const formatter1 = getNumberFormatter({ style: "currency", currency: "USD" });
      const formatter2 = getNumberFormatter({ style: "decimal" });
      expect(formatter1).not.toBe(formatter2);
    });
  });

  describe("getDateTimeFormatter", () => {
    it("returns the same instance for identical options", () => {
      const options = { year: "numeric", month: "short" } as const;
      const formatter1 = getDateTimeFormatter(options);
      const formatter2 = getDateTimeFormatter(options);
      expect(formatter1).toBe(formatter2);
    });
  });

  describe("centralized formatters", () => {
    it("USD_FORMATTER matches expected configuration", () => {
      expect(USD_FORMATTER.format(1234.56)).toBe("$1,234.56");
    });

    it("DATE_FORMATTER_FULL matches expected configuration", () => {
      const date = new Date(2025, 4, 15); // May 15, 2025
      // en-US format is usually "May 15, 2025" or similar
      expect(DATE_FORMATTER_FULL.format(date)).toContain("May 15, 2025");
    });
  });
});
