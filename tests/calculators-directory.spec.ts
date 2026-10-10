import { describe, expect, it } from "vitest";
import { SEARCH_INDEX, searchPages } from "@/app/calculators/CalculatorsDirectoryClient";

describe("CalculatorsDirectory search indexing", () => {
  it("builds pre-lowercased search index correctly", () => {
    expect(SEARCH_INDEX.length).toBeGreaterThan(0);
    const first = SEARCH_INDEX[0];
    expect(first.lowerTitle).toBe(first.title.toLowerCase());
    expect(first.lowerCategoryLabel).toBe(first.categoryLabel.toLowerCase());
    expect(first.lowerHref).toBe(first.href.toLowerCase());
  });

  it("returns relevant results for queries using production searchPages", () => {
    const concreteResults = searchPages("concrete");
    expect(concreteResults.length).toBeGreaterThan(0);
    expect(
      concreteResults.some(
        (r) =>
          r.lowerTitle.includes("concrete") ||
          r.lowerCategoryLabel.includes("concrete")
      )
    ).toBe(true);
  });

  it("returns empty array for empty query", () => {
    expect(searchPages("")).toEqual([]);
    expect(searchPages("   ")).toEqual([]);
  });
});
