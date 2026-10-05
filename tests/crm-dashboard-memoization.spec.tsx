import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrmDashboardClient } from "@/app/command-center/crm/CrmDashboardClient";
import type { ClientDTO } from "@/lib/dal/clients";

describe("CrmDashboardClient performance & filtering", () => {
  const mockClients: ClientDTO[] = [
    {
      id: "client-1",
      name: "Acme Builders",
      email: "acme@example.com",
      phone: "555-0100",
      address: "100 Main St, Syracuse NY",
      notes: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "client-2",
      name: "John Doe",
      email: "johndoe@test.com",
      phone: "555-0200",
      address: "200 Oak Ave, Albany NY",
      notes: null,
      createdAt: "2026-01-02T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    },
  ];

  it("renders all initial clients when search query is empty", () => {
    const html = renderToStaticMarkup(
      <CrmDashboardClient initialClients={mockClients} />
    );

    expect(html).toContain("Acme Builders");
    expect(html).toContain("John Doe");
    expect(html).toContain("2 clients match");
  });

  it("renders empty state when no clients are provided", () => {
    const html = renderToStaticMarkup(
      <CrmDashboardClient initialClients={[]} />
    );

    expect(html).toContain("0 clients match");
    expect(html).toContain("No clients found");
  });
});
