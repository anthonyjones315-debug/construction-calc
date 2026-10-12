import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CommandCenterLiteClient from "@/app/command-center/CommandCenterLiteClient";

describe("CommandCenterLiteClient", () => {
  it("correctly counts and renders estimate status KPIs in a single pass", () => {
    const mockEstimates = [
      {
        id: "est-1",
        name: "Deck Construction",
        clientName: "John Doe",
        status: "SIGNED",
        updatedAt: "2026-03-15T10:00:00Z",
      },
      {
        id: "est-2",
        name: "Patio Repair",
        clientName: "Jane Smith",
        status: "Approved",
        updatedAt: "2026-03-16T12:00:00Z",
      },
      {
        id: "est-3",
        name: "Kitchen Remodel",
        clientName: "Bob Miller",
        status: "PENDING",
        updatedAt: "2026-03-17T14:00:00Z",
      },
      {
        id: "est-4",
        name: "Bathroom Tile",
        clientName: "Alice Davis",
        status: "Sent",
        updatedAt: "2026-03-18T16:00:00Z",
      },
      {
        id: "est-5",
        name: "Roof Framing",
        clientName: null,
        status: "DRAFT",
        updatedAt: "2026-03-19T18:00:00Z",
      },
    ];

    const html = renderToStaticMarkup(
      <CommandCenterLiteClient
        businessName="Apex Builders"
        joinCode="ABC12345"
        initialMembers={[
          {
            membershipId: "mem-1",
            userId: "user-1",
            name: "Alex Owner",
            email: "alex@apex.com",
            role: "owner",
            joinedAt: "2026-01-01T00:00:00Z",
          },
        ]}
        recentEstimates={mockEstimates}
        needsBusinessProfileSetup={false}
        userRole="owner"
      />,
    );

    expect(html).toContain("Apex Builders");
    expect(html).toContain("Deck Construction");
    expect(html).toContain("John Doe");

    // Total Estimates count: 5
    expect(html).toContain("Total Estimates");
    expect(html).toContain("5");

    // Signed count (SIGNED + Approved): 2
    expect(html).toContain("Signed");
    expect(html).toContain("2");

    // Sent count (PENDING + Sent): 2
    expect(html).toContain("Sent");

    // Draft count: 1
    expect(html).toContain("Drafts");
    expect(html).toContain("1");
  });

  it("handles empty recent estimates gracefully", () => {
    const html = renderToStaticMarkup(
      <CommandCenterLiteClient
        businessName="Solo Construction"
        joinCode="SOLO1234"
        initialMembers={[]}
        recentEstimates={[]}
        needsBusinessProfileSetup={true}
        userRole="admin"
      />,
    );

    expect(html).toContain("Solo Construction");
    expect(html).toContain("No estimates yet");
    expect(html).toContain("Business profile setup is incomplete.");
  });
});
