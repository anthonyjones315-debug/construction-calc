import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SignEstimateClient } from "@/app/sign/[code]/SignEstimateClient";

describe("SignEstimateClient", () => {
  const mockEstimate = {
    id: "est-123",
    name: "Deck Construction",
    calculatorId: "decking",
    calculatorLabel: "Decking Calculator",
    clientName: "John Doe",
    jobSiteAddress: "123 Main St",
    status: "Sent" as const,
    results: [
      { label: "Total Cost", value: 2500, unit: "USD" },
      { label: "Deck Area", value: 300, unit: "sq ft" },
    ],
    materialList: ["Pressure Treated Boards", "Screws"],
    shareCode: "code-123",
    signUrl: "https://example.com/sign",
    generatedAt: "2026-03-01T12:00:00Z",
    jobName: "Main St Deck",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
    signing: {
      status: "pending" as const,
      inviteRecipientEmail: "client@example.com",
    },
    contractor: {
      name: "Apex Builders",
      phone: "555-0199",
      email: "info@apex.com",
      logoUrl: null,
    },
  };

  it("renders pending estimate details and formats currency and date correctly", () => {
    const html = renderToStaticMarkup(<SignEstimateClient estimate={mockEstimate} />);

    expect(html).toContain("Apex Builders");
    expect(html).toContain("Main St Deck");
    expect(html).toContain("$2,500.00");
    expect(html).toContain("Pending Signature");
    expect(html).toContain("Mar 1, 2026");
  });

  it("renders signed estimate status with formatted timestamp", () => {
    const signedEstimate = {
      ...mockEstimate,
      status: "SIGNED" as const,
      signing: {
        status: "signed" as const,
        signerName: "John Doe",
        signedAt: "2026-03-02T15:30:00Z",
      },
    };

    const html = renderToStaticMarkup(<SignEstimateClient estimate={signedEstimate} />);

    expect(html).toContain("Signed");
    expect(html).toContain("Estimate approved &amp; signed");
    expect(html).toContain("Signed by John Doe");
  });
});
