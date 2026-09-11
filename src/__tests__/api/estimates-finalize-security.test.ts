import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((_opts, cb) => cb()),
}));

import { POST } from "@/app/api/estimates/finalize/route";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

describe("POST /api/estimates/finalize Security", () => {
  it("returns generic 'Internal Server Error' (500) and conceals database errors", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "test@example.com", name: "Test User" },
      expires: "2099-01-01",
    } as never);

    vi.mocked(createServerClient).mockImplementationOnce(() => {
      throw new Error("fatal_pg_connection_leak_sensitive_info");
    });

    const validPayload = {
      name: "Test Estimate",
      calculator_id: "concrete/slab",
      client_name: "John Doe",
      job_site_address: "123 Main St",
      total_cost: 5000,
      results: [{ label: "Concrete Volume", value: 10, unit: "cu yd" }],
      material_list: ["10 cu yd concrete"],
      inputs: { selected_county: "Oneida" },
      metadata: {
        title: "Slab Calculation",
        calculatorLabel: "Concrete Slab Calculator",
        generatedAt: "2026-03-17T00:00:00.000Z",
      },
    };

    const request = new NextRequest("http://localhost/api/estimates/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(json)).not.toContain("fatal_pg_connection_leak_sensitive_info");
  });
});
