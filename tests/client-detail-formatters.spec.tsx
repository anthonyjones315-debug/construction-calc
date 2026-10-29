import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClientDetailClient } from "@/app/command-center/crm/[id]/ClientDetailClient";
import type { ClientDTO } from "@/lib/dal/clients";

describe("ClientDetailClient formatters", () => {
  const sampleClient: ClientDTO = {
    id: "client-123",
    businessId: "biz-1",
    name: "Acme Construction Corp",
    email: "info@acme.com",
    phone: "(555) 019-2831",
    address: "100 Main St, Utica, NY",
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const sampleEstimates = [
    {
      id: "est-1",
      name: "Kitchen Renovation",
      status: "SIGNED",
      total_cost: 12500,
      updated_at: "2026-03-15T10:00:00.000Z",
    },
    {
      id: "est-2",
      name: "Bathroom Plumbing",
      status: "PENDING",
      total_cost: null,
      updated_at: "2026-03-16T14:30:00.000Z",
    },
  ];

  it("renders formatted currency and updated dates for client estimates", () => {
    const html = renderToStaticMarkup(
      <ClientDetailClient client={sampleClient} estimates={sampleEstimates} />,
    );

    // Verify client title
    expect(html).toContain("Acme Construction Corp");

    // Verify formatted total cost ($12,500) via cached number formatter
    expect(html).toContain("$12,500");

    // Verify "Pending" status for null total cost
    expect(html).toContain("Pending");

    // Verify estimate names
    expect(html).toContain("Kitchen Renovation");
    expect(html).toContain("Bathroom Plumbing");

    // Verify formatted dates via cached date time formatter
    expect(html).toContain("3/15/2026");
    expect(html).toContain("3/16/2026");
  });
});
