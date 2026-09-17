import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  FinancialDashboard,
  getEstimateStatus,
  getProjectProfitMargin,
  formatStatus,
  type SavedEstimate,
} from "@/components/financial/FinancialDashboard";

describe("FinancialDashboard component & profit margin helpers", () => {
  const sampleEstimates: SavedEstimate[] = [
    {
      id: "est-1",
      name: "Deck Renovation",
      calculator_id: "exterior/decking",
      total_cost: 5000,
      status: "SIGNED",
      created_at: "2026-03-01T10:00:00.000Z",
      updated_at: "2026-03-05T12:00:00.000Z",
      budget_items: [
        {
          name: "Lumber materials",
          category: "material",
          quantity: 1,
          pricePerUnit: 2000,
          actual_cost: 2500,
        },
        {
          name: "Carpentry crew",
          category: "labor",
          quantity: 1,
          pricePerUnit: 1000,
          actual_cost: 1000,
        },
      ],
      results: [],
    },
    {
      id: "est-2",
      name: "Bathroom Remodel",
      calculator_id: "interior/tile",
      total_cost: 8000,
      status: "Draft",
      created_at: "2026-03-02T10:00:00.000Z",
      updated_at: "2026-03-06T15:00:00.000Z",
      budget_items: [
        {
          name: "Tile & grout",
          category: "material",
          quantity: 1,
          pricePerUnit: 3000,
        },
      ],
      results: [],
    },
  ];

  it("correctly normalizes status and calculates project profit margin", () => {
    const status = getEstimateStatus(sampleEstimates[0]);
    expect(status).toBe("SIGNED");
    expect(formatStatus(status)).toBe("Signed");

    // Est-1: revenue $5000, tracked actual cost $2500 (material) + $1000 (labor) = $3500 cost.
    // Margin = (5000 - 3500) / 5000 = 30%
    const margin = getProjectProfitMargin(sampleEstimates[0]);
    expect(margin).toBeCloseTo(30, 1);
  });

  it("renders FinancialDashboard with metrics, project profit margins, and last sync timestamp", () => {
    const lastSyncDate = new Date("2026-03-18T14:30:00.000Z");
    const html = renderToStaticMarkup(
      <FinancialDashboard
        estimates={sampleEstimates}
        refreshing={false}
        lastUpdatedAt={lastSyncDate}
      />,
    );

    expect(html).toContain("Deck Renovation");
    expect(html).toContain("Bathroom Remodel");
    expect(html).toContain("Cost Variance Alerts");
    expect(html).toContain("Material actual $2,500.00 exceeded estimate $2,000.00");
    expect(html).toContain("Billed");
    expect(html).toContain("Unbilled");
    expect(html).toContain("Last sync");
  });
});
