import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/estimates/save/route";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeId: vi.fn(() => "tenant-123"),
  getTenantScopeColumn: vi.fn(() => "user_id"),
  assertNoBusinessIdOverride: vi.fn(),
}));

vi.mock("@/lib/estimates/name-generator", () => ({
  generateAutoEstimateName: vi.fn(() => Promise.resolve("Test Estimate")),
}));

vi.mock("@/app/actions/calculations", () => ({
  saveCalculation: vi.fn(),
  verifyEstimate: vi.fn(() => ({
    subtotal_cents: 1000,
    tax_cents: 80,
    total_cents: 1080,
    tax_basis_points: 800,
    verified_county: "Oneida",
    verification_status: "VERIFIED",
  })),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn(() => ({
    capture: vi.fn(),
    shutdown: vi.fn(() => Promise.resolve()),
  })),
}));

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";
import { saveCalculation } from "@/app/actions/calculations";

describe("POST /api/estimates/save security error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://sensitive-project-id.supabase.co";

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com", name: "Test User" },
      expires: "2099-01-01",
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      userId: "user-123",
      businessId: null,
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: true,
    });

    vi.mocked(createServerClient).mockReturnValue({
      schema: vi.fn().mockReturnThis(),
    } as any);
  });

  it("does not leak raw database error message or Supabase project URL on database error", async () => {
    const rawDbError = {
      message: "relation public.saved_estimates does not exist - internal Postgres error details",
      code: "42P01",
    };

    vi.mocked(saveCalculation).mockResolvedValue({
      data: null,
      error: rawDbError as any,
      correctedData: null,
    });

    const request = new NextRequest("http://localhost:3000/api/estimates/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calculator_id: "flooring-waste",
        client_name: "Jane Doe",
        total_cost: 1500,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toMatch(/^Save failed\. \(ref: [a-f0-9-]+\)$/);
    expect(body.error).not.toContain("public.saved_estimates");
    expect(body.error).not.toContain("Postgres error");
    expect(body.error).not.toContain("sensitive-project-id");
  });

  it("does not leak internal missing ID details when save returns no data id", async () => {
    vi.mocked(saveCalculation).mockResolvedValue({
      data: null,
      error: null,
      correctedData: null,
    });

    const request = new NextRequest("http://localhost:3000/api/estimates/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calculator_id: "flooring-waste",
        client_name: "Jane Doe",
        total_cost: 1500,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toMatch(/^Save failed\. \(ref: [a-f0-9-]+\)$/);
    expect(body.error).not.toContain("missing estimate id");
  });
});
