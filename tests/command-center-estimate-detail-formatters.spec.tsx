import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { EstimateDetailClient } from "@/app/command-center/estimates/[id]/EstimateDetailClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("EstimateDetailClient cached formatters", () => {
  it("renders estimate details, line items, and signature dates with cached formatters", () => {
    const mockEstimate = {
      id: "est-123",
      name: "Kitchen Renovation",
      clientName: "Alice Smith",
      jobSiteAddress: "456 Elm St, Syracuse, NY",
      status: "SIGNED",
      results: [],
      totalCost: 12500.5,
      shareCode: "XYZ123",
      calculatorLabel: "Custom Estimate",
      jobName: "Kitchen Renovation",
      materialList: ["Cabinets", "Countertops"],
      lineItems: [
        {
          id: "item-1",
          description: "Custom Hardwood Cabinets",
          quantity: 1,
          unit: "set",
          unitPrice: 8500,
        },
        {
          id: "item-2",
          description: "Quartz Countertops",
          quantity: 2,
          unit: "slabs",
          unitPrice: 2000.25,
        },
      ],
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-02T12:00:00.000Z",
      contractorSignatureDataUrl: "data:image/png;base64,mockContractorSig",
      contractorSignedAt: "2026-03-01T11:00:00.000Z",
      clientSignatureDataUrl: "data:image/png;base64,mockClientSig",
      clientSignedAt: "2026-03-01T15:30:00.000Z",
      clientSignerName: "Alice Smith",
      signUrl: "https://example.com/sign/XYZ123",
    };

    const html = renderToStaticMarkup(
      <EstimateDetailClient estimate={mockEstimate} canDelete />,
    );

    expect(html).toContain("Kitchen Renovation");
    expect(html).toContain("Alice Smith");
    expect(html).toContain("$12,500.50");
    expect(html).toContain("Custom Hardwood Cabinets");
    expect(html).toContain("$8,500.00");
    expect(html).toContain("$4,000.50");
    expect(html).toContain("Fully executed — both parties have signed.");
  });
});
