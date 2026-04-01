import { describe, it, expect } from "vitest";
import { getNumberFormatter, getDateTimeFormatter } from "./formatters";

describe("formatters", () => {
  describe("getNumberFormatter", () => {
    it("returns a formatter with default options", () => {
      const formatter = getNumberFormatter();
      expect(formatter.format(1234.56)).toBe("1,234.56");
    });

    it("caches instances with the same options", () => {
      const f1 = getNumberFormatter("en-US", { minimumFractionDigits: 2 });
      const f2 = getNumberFormatter("en-US", { minimumFractionDigits: 2 });
      expect(f1).toBe(f2);
    });

    it("returns different instances for different options", () => {
      const f1 = getNumberFormatter("en-US", { minimumFractionDigits: 2 });
      const f2 = getNumberFormatter("en-US", { minimumFractionDigits: 3 });
      expect(f1).not.toBe(f2);
    });

    it("is deterministic regardless of option key order", () => {
      const f1 = getNumberFormatter("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      } as Intl.NumberFormatOptions);
      const f2 = getNumberFormatter("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      } as Intl.NumberFormatOptions);
      expect(f1).toBe(f2);
    });
  });

  describe("getDateTimeFormatter", () => {
    it("caches instances with the same options", () => {
      const options = { month: "short" as const, day: "numeric" as const };
      const f1 = getDateTimeFormatter("en-US", options);
      const f2 = getDateTimeFormatter("en-US", options);
      expect(f1).toBe(f2);
    });
  });
});
