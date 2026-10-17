import { describe, expect, it } from "vitest";
import {
  getProjectProfitMargin,
  type SavedEstimate,
} from "@/components/financial/FinancialDashboard";

describe("FinancialDashboard optimizations", () => {
  const sampleEstimate: SavedEstimate = {
    id: "est-123",
    name: "Deck Construction",
    calculator_id: "deck-calc",
    total_cost: 1000,
    created_at: "2026-03-01T00:00:00.000Z",
    results: [],
    budget_items: [
      {
        id: "b-1",
        name: "Lumber",
        category: "material",
        quantity: 10,
        pricePerUnit: 50, // $500 estimated
        actualCost: 600, // $600 actual
      },
    ],
  };

  it("calculates profit margin correctly with automatic tracked cost", () => {
    // Revenue = 1000, Actual Cost = 600, Margin = (1000 - 600)/1000 * 100 = 40%
    const margin = getProjectProfitMargin(sampleEstimate);
    expect(margin).toBeCloseTo(40, 5);
  });

  it("calculates profit margin correctly when passing a pre-computed tracked cost override", () => {
    // Passing pre-computed cost 600 directly
    const margin = getProjectProfitMargin(sampleEstimate, 600);
    expect(margin).toBeCloseTo(40, 5);
  });

  it("returns null for non-positive revenue or missing tracked cost", () => {
    const invalidEstimate: SavedEstimate = {
      ...sampleEstimate,
      total_cost: 0,
    };
    expect(getProjectProfitMargin(invalidEstimate)).toBeNull();
  });
});
