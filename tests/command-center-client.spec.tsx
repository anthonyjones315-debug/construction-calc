import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    userId: "user_123",
    isLoaded: true,
  }),
  UserButton: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <div data-testid="user-button">{children}</div>,
    {
      MenuItems: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
      Link: ({ label }: { label: string }) => <div>{label}</div>,
    },
  ),
}));

vi.mock("@sentry/nextjs", () => ({
  getFeedback: () => undefined,
}));

import CommandCenterClient from "@/app/command-center/CommandCenterClient";

describe("CommandCenterClient", () => {
  it("renders status KPI counts (Closed/Signed, Sent/Waiting, Drafts Active) correctly", () => {
    const recentEstimates = [
      { id: "est-1", name: "Foundation Pour", clientName: "Acme Corp", status: "SIGNED", updatedAt: "2026-03-18T10:00:00Z" },
      { id: "est-2", name: "Roof Repair", clientName: "John Doe", status: "Sent", updatedAt: "2026-03-17T10:00:00Z" },
      { id: "est-3", name: "Deck Framing", clientName: "Jane Smith", status: "Draft", updatedAt: "2026-03-16T10:00:00Z" },
      { id: "est-4", name: "Driveway Concrete", clientName: "Bob Builder", status: "Approved", updatedAt: "2026-03-15T10:00:00Z" },
    ];

    const html = renderToStaticMarkup(
      <CommandCenterClient
        businessName="Apex Construction"
        joinCode="JOIN1234"
        initialMembers={[
          { membershipId: "m1", userId: "u1", name: "Alice Owner", email: "alice@example.com", role: "owner", joinedAt: "2026-01-01T00:00:00Z" },
        ]}
        recentEstimates={recentEstimates}
        needsBusinessProfileSetup={false}
        userRole="owner"
      />,
    );

    expect(html).toContain("Apex Construction");
    expect(html).toContain("Closed / Signed");
    expect(html).toContain("Sent / Waiting");
    expect(html).toContain("Drafts Active");
    expect(html).toContain("Foundation Pour");
    expect(html).toContain("Roof Repair");
    expect(html).toContain("Deck Framing");
  });
});
