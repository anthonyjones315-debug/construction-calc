import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrmDashboardClient } from "@/app/command-center/crm/CrmDashboardClient";
import type { ClientDTO } from "@/lib/dal/clients";

describe("CrmDashboardClient", () => {
  const mockClients: ClientDTO[] = [
    {
      id: "cli-1",
      name: "Alice Smith",
      email: "alice@example.com",
      phone: "555-1010",
      address: "100 Oak St",
      notes: "Preferred customer",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "cli-2",
      name: "Bob Jones",
      email: "bob@example.com",
      phone: "555-2020",
      address: "200 Maple Ave",
      notes: "Commercial client",
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    },
  ];

  it("renders initial list of clients correctly", () => {
    const html = renderToStaticMarkup(<CrmDashboardClient initialClients={mockClients} />);

    expect(html).toContain("Alice Smith");
    expect(html).toContain("bob@example.com");
    expect(html).toContain("2 clients match");
    expect(html).toContain("Search clients by name, email, or phone...");
  });

  it("renders empty state when initial clients list is empty", () => {
    const html = renderToStaticMarkup(<CrmDashboardClient initialClients={[]} />);

    expect(html).toContain("No clients found");
    expect(html).toContain("Get started by adding your first client.");
    expect(html).toContain("0 clients match");
  });
});
