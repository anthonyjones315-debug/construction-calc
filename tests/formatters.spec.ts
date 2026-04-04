import { describe, it, expect } from "vitest";
import { getNumberFormatter, getDateTimeFormatter } from "@/utils/formatters";

describe("formatters utility", () => {
  describe("getNumberFormatter", () => {
    it("should return a cached instance for same options", () => {
      const f1 = getNumberFormatter("en-US", { style: "currency", currency: "USD" });
      const f2 = getNumberFormatter("en-US", { style: "currency", currency: "USD" });
      expect(f1).toBe(f2);
    });

    it("should return different instances for different options", () => {
      const f1 = getNumberFormatter("en-US", { style: "currency", currency: "USD" });
      const f2 = getNumberFormatter("en-US", { style: "decimal" });
      expect(f1).not.toBe(f2);
    });

    it("should return same instance regardless of option key order", () => {
      const f1 = getNumberFormatter("en-US", { style: "currency", currency: "USD" });
      const f2 = getNumberFormatter("en-US", { currency: "USD", style: "currency" });
      expect(f1).toBe(f2);
    });

    it("should format numbers correctly", () => {
      const f = getNumberFormatter("en-US", { style: "currency", currency: "USD" });
      expect(f.format(1234.56)).toBe("$1,234.56");
    });
  });

  describe("getDateTimeFormatter", () => {
    it("should return a cached instance for same options", () => {
      const f1 = getDateTimeFormatter("en-US", { month: "short", year: "numeric" });
      const f2 = getDateTimeFormatter("en-US", { month: "short", year: "numeric" });
      expect(f1).toBe(f2);
    });

    it("should return different instances for different options", () => {
      const f1 = getDateTimeFormatter("en-US", { month: "short" });
      const f2 = getDateTimeFormatter("en-US", { month: "long" });
      expect(f1).not.toBe(f2);
    });

    it("should format dates correctly", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      // Use UTC to ensure consistent testing across environments
      const f = getDateTimeFormatter("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
      expect(f.format(date)).toBe("Jan 2023");
    });
  });
});
