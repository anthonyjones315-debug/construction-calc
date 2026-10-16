import { describe, expect, it } from "vitest";
import {
  getProjectProfitMargin,
  FinancialDashboard,
  type SavedEstimate,
} from "@/components/financial/FinancialDashboard";

describe("FinancialDashboard Optimization", () => {
  const sampleEstimate: SavedEstimate = {
    id: "est-101",
    name: "Deck Construction",
    calculator_id: "framing/deck",
    total_cost: 1000,
    status: "Approved",
    created_at: "2026-03-01T00:00:00.000Z",
    results: [],
    budget_items: [
      {
        id: "b-1",
        name: "Lumber",
        category: "material",
        quantity: 10,
        pricePerUnit: 50,
      },
      {
        id: "b-2",
        name: "Labor Crew",
        category: "labor",
        quantity: 5,
        pricePerUnit: 40,
      },
    ],
  };

  it("calculates profit margin correctly without pre-computed tracked cost", () => {
    // Total revenue = $1000, tracked cost = (10 * 50) + (5 * 40) = $700
    // Margin = (1000 - 700) / 1000 = 30%
    const margin = getProjectProfitMargin(sampleEstimate);
    expect(margin).toBeCloseTo(30, 2);
  });

  it("calculates profit margin identically when passing pre-computed tracked cost", () => {
    const precomputedCost = 700;
    const margin = getProjectProfitMargin(sampleEstimate, precomputedCost);
    expect(margin).toBeCloseTo(30, 2);
  });

  it("returns null margin when total_cost is null or 0", () => {
    const zeroCostEstimate: SavedEstimate = {
      ...sampleEstimate,
      total_cost: 0,
    };
    expect(getProjectProfitMargin(zeroCostEstimate)).toBeNull();
    expect(getProjectProfitMargin(zeroCostEstimate, 700)).toBeNull();
  });

  it("exports FinancialDashboard component function", () => {
    expect(FinancialDashboard).toBeDefined();
    expect(typeof FinancialDashboard).toBe("function");
  });
});
