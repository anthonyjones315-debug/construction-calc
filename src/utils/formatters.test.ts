import { describe, it, expect } from "vitest";
import { getNumberFormatter, getDateTimeFormatter } from "./formatters";

describe("formatters", () => {
  describe("getNumberFormatter", () => {
    it("returns an Intl.NumberFormat instance", () => {
      const formatter = getNumberFormatter({ style: "currency", currency: "USD" });
      expect(formatter).toBeInstanceOf(Intl.NumberFormat);
      expect(formatter.format(100)).toContain("$100.00");
    });

    it("caches instances for the same options", () => {
      const options = { style: "currency", currency: "USD" };
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
    it("returns an Intl.DateTimeFormat instance", () => {
      const formatter = getDateTimeFormatter({ year: "numeric", month: "short", day: "numeric" });
      expect(formatter).toBeInstanceOf(Intl.DateTimeFormat);
      const date = new Date(2023, 0, 1);
      expect(formatter.format(date)).toContain("Jan 1, 2023");
    });

    it("caches instances for the same options", () => {
      const options: Intl.DateTimeFormatOptions = { year: "numeric" };
      const formatter1 = getDateTimeFormatter(options);
      const formatter2 = getDateTimeFormatter(options);
      expect(formatter1).toBe(formatter2);
    });
  });

  describe("deterministic cache key", () => {
    it("generates the same key regardless of option key order", () => {
      const options1: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
      const options2: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };

      const formatter1 = getDateTimeFormatter(options1);
      const formatter2 = getDateTimeFormatter(options2);

      expect(formatter1).toBe(formatter2);
    });
  });
});
