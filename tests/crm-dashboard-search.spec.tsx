import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrmDashboardClient } from "@/app/command-center/crm/CrmDashboardClient";
import type { ClientDTO } from "@/lib/dal/clients";

describe("CrmDashboardClient search filtering", () => {
  const mockClients: ClientDTO[] = [
    {
      id: "client-1",
      name: "Acme Builders",
      email: "contact@acme.com",
      phone: "555-0101",
      address: "100 Industrial Pkwy",
      notes: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "client-2",
      name: "Summit Construction",
      email: "info@summit.com",
      phone: "555-0202",
      address: "200 Mountain Ave",
      notes: null,
      createdAt: "2026-01-02T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    },
  ];

  it("renders initial clients and displays correct client count", () => {
    const html = renderToStaticMarkup(
      <CrmDashboardClient initialClients={mockClients} />,
    );

    expect(html).toContain("2 clients match");
    expect(html).toContain("Acme Builders");
    expect(html).toContain("Summit Construction");
    expect(html).toContain("contact@acme.com");
    expect(html).toContain("555-0202");
  });

  it("handles empty initial client list gracefully", () => {
    const html = renderToStaticMarkup(
      <CrmDashboardClient initialClients={[]} />,
    );

    expect(html).toContain("0 clients match");
    expect(html).toContain("No clients found");
  });
});
