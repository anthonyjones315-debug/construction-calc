import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrmDashboardClient } from "@/app/command-center/crm/CrmDashboardClient";
import type { ClientDTO } from "@/lib/dal/clients";

describe("CrmDashboardClient", () => {
  const mockClients: ClientDTO[] = [
    {
      id: "client-1",
      business_id: "biz-1",
      name: "John Doe",
      email: "john@example.com",
      phone: "(555) 123-4567",
      address: "100 Main St, Syracuse NY",
      notes: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "client-2",
      business_id: "biz-1",
      name: "Jane Smith",
      email: "jane@buildcorp.com",
      phone: "(555) 987-6543",
      address: "200 Oak Ave, Albany NY",
      notes: null,
      created_at: "2026-01-02T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    },
  ];

  it("renders initial clients in the dashboard", () => {
    const html = renderToStaticMarkup(
      <CrmDashboardClient initialClients={mockClients} />,
    );

    expect(html).toContain("John Doe");
    expect(html).toContain("Jane Smith");
    expect(html).toContain("2 clients match");
    expect(html).toContain("john@example.com");
    expect(html).toContain("200 Oak Ave, Albany NY");
  });

  it("handles empty initial clients list gracefully", () => {
    const html = renderToStaticMarkup(
      <CrmDashboardClient initialClients={[]} />,
    );

    expect(html).toContain("No clients found");
    expect(html).toContain("0 clients match");
    expect(html).toContain("Get started by adding your first client.");
  });
});
