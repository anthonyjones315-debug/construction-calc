import { describe, expect, it } from "vitest";
import {
  getProjectProfitMargin,
  type SavedEstimate,
} from "@/components/financial/FinancialDashboard";

describe("Financial Dashboard Optimization", () => {
  it("calculates project profit margin correctly", () => {
    const estimate: SavedEstimate = {
      id: "est-1",
      name: "Deck Project",
      calculator_id: "decking",
      total_cost: 1000,
      status: "SIGNED",
      created_at: "2026-03-01T00:00:00Z",
      results: [],
      budget_items: [
        { name: "Lumber", quantity: 10, pricePerUnit: 50, category: "material" },
      ],
    };

    // Revenue 1000, tracked cost 500 => margin = (1000 - 500) / 1000 * 100 = 50%
    const margin = getProjectProfitMargin(estimate);
    expect(margin).toBe(50);
  });

  it("reuses pre-computed tracked cost in getProjectProfitMargin", () => {
    const estimate: SavedEstimate = {
      id: "est-2",
      name: "Roofing Project",
      calculator_id: "roofing",
      total_cost: 2000,
      status: "Draft",
      created_at: "2026-03-01T00:00:00Z",
      results: [],
      budget_items: [],
    };

    // Passing precomputed cost directly
    const marginWithPrecomputed = getProjectProfitMargin(estimate, 1500);
    expect(marginWithPrecomputed).toBe(25);
  });

  it("handles null and zero revenue cleanly", () => {
    const estimateNoCost: SavedEstimate = {
      id: "est-3",
      name: "Empty Estimate",
      calculator_id: "general",
      total_cost: null,
      status: "Draft",
      created_at: "2026-03-01T00:00:00Z",
      results: [],
    };

    expect(getProjectProfitMargin(estimateNoCost)).toBeNull();
  });
});
