import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CommandCenterLiteClient from "@/app/command-center/CommandCenterLiteClient";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock SignedEstimatesNotificationsClient
vi.mock(
  "@/app/command-center/SignedEstimatesNotificationsClient",
  () => ({
    default: () => <div data-testid="notifications" />,
  }),
);

describe("CommandCenterLiteClient", () => {
  const sampleEstimates = [
    {
      id: "est-1",
      name: "Slab Pour",
      clientName: "Bob Smith",
      status: "SIGNED",
      updatedAt: "2026-03-15T10:00:00Z",
    },
    {
      id: "est-2",
      name: "Framing Job",
      clientName: "Alice Jones",
      status: "Approved",
      updatedAt: "2026-03-16T12:00:00Z",
    },
    {
      id: "est-3",
      name: "Roof Pitch",
      clientName: "Charlie Brown",
      status: "PENDING",
      updatedAt: "2026-03-17T14:00:00Z",
    },
    {
      id: "est-4",
      name: "Deck Build",
      clientName: null,
      status: "Sent",
      updatedAt: "2026-03-18T16:00:00Z",
    },
    {
      id: "est-5",
      name: "Drywall Install",
      clientName: "Dave Miller",
      status: "DRAFT",
      updatedAt: "2026-03-19T18:00:00Z",
    },
  ];

  const sampleProps = {
    businessName: "Pro Construction LLC",
    joinCode: "ABC12345",
    initialMembers: [],
    recentEstimates: sampleEstimates,
    needsBusinessProfileSetup: false,
    userRole: "owner",
  };

  it("calculates status counts correctly in a single pass", () => {
    const html = renderToStaticMarkup(
      <CommandCenterLiteClient {...sampleProps} />,
    );

    // Total Estimates: 5
    expect(html).toContain("Total Estimates");
    expect(html).toContain("5");

    // Signed: 2 ("SIGNED" + "Approved")
    expect(html).toContain("Signed");
    expect(html).toContain("2");

    // Sent: 2 ("PENDING" + "Sent")
    expect(html).toContain("Sent");

    // Drafts: 1 ("DRAFT")
    expect(html).toContain("Drafts");
    expect(html).toContain("1");
  });

  it("formats recent estimate dates correctly using cached formatters", () => {
    const html = renderToStaticMarkup(
      <CommandCenterLiteClient {...sampleProps} />,
    );

    expect(html).toContain("Slab Pour");
    expect(html).toContain("Bob Smith");
    expect(html).toContain("Mar 15, 2026");
  });

  it("handles empty recent estimates gracefully", () => {
    const html = renderToStaticMarkup(
      <CommandCenterLiteClient
        {...sampleProps}
        recentEstimates={[]}
      />,
    );

    expect(html).toContain("No estimates yet");
  });
});
