import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/estimates/finalize/route";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

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

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn().mockReturnValue({
    capture: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("POST /api/estimates/finalize Security Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    const req = new NextRequest("http://localhost:3000/api/estimates/finalize", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns 500 Internal Server Error without leaking internal error details on failure", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "test@example.com" },
    } as never);

    // Force createServerClient to throw a detailed database exception
    vi.mocked(createServerClient).mockImplementationOnce(() => {
      throw new Error("DATABASE_SECRET_KEY_EXPOSED_OR_CONNECTION_FAILED: postgresql://admin:secret@db.internal:5432");
    });

    const validPayload = {
      name: "Test Estimate",
      calculator_id: "interior/flooring",
      results: [{ label: "Total Area", value: 500, unit: "sq ft" }],
      material_list: ["Flooring Planks"],
      metadata: {
        title: "Test Estimate",
        calculatorLabel: "Flooring",
        generatedAt: "2026-01-01",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/estimates/finalize", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(data)).not.toContain("DATABASE_SECRET_KEY_EXPOSED");
    expect(JSON.stringify(data)).not.toContain("db.internal");
  });
});
