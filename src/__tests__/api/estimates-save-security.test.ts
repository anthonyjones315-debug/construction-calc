import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => ({
    schema: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeId: vi.fn(() => "tenant-123"),
  getTenantScopeColumn: vi.fn(() => "business_id"),
  assertNoBusinessIdOverride: vi.fn(),
}));

vi.mock("@/lib/estimates/name-generator", () => ({
  generateAutoEstimateName: vi.fn(async () => "Estimate #1"),
}));

vi.mock("@/app/actions/calculations", () => ({
  saveCalculation: vi.fn(),
  verifyEstimate: vi.fn(() => ({
    subtotal_cents: 1000,
    tax_cents: 0,
    total_cents: 1000,
    tax_basis_points: 0,
    verified_county: null,
    verification_status: "VERIFIED",
  })),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn(() => ({
    capture: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

import { POST } from "@/app/api/estimates/save/route";
import { auth } from "@/lib/auth/config";
import { getBusinessContextForSession } from "@/lib/supabase/business";
import { saveCalculation } from "@/app/actions/calculations";
import * as Sentry from "@sentry/nextjs";

describe("/api/estimates/save Security Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const req = new NextRequest("http://localhost:3000/api/estimates/save", {
      method: "POST",
      body: JSON.stringify({ name: "Test Estimate" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 Bad Request when request body is invalid JSON", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "user@example.com" },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/estimates/save", {
      method: "POST",
      body: "{ invalid json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "Invalid request." });
  });

  it("returns generic 500 error without disclosing raw database error when insert fails", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "user@example.com" },
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValueOnce({
      isOwner: true,
      usesLegacyUserScope: false,
      businessId: "biz-123",
      role: "owner",
    } as any);

    const sensitiveDbError = new Error(
      'relation "public.saved_estimates" does not exist; foreign key constraint violation on user_id_fkey',
    );
    (sensitiveDbError as any).code = "42P01";

    vi.mocked(saveCalculation).mockResolvedValueOnce({
      data: null,
      error: sensitiveDbError,
      correctedData: null,
    } as any);

    const req = new NextRequest("http://localhost:3000/api/estimates/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calculator_id: "flooring-calculator",
        total_cost: 1500,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toMatch(/^Failed to save estimate\. \(ref: .+\)$/);
    expect(body.error).not.toContain("public.saved_estimates");
    expect(body.error).not.toContain("foreign key constraint");
    expect(body.error).not.toContain("Database schema mismatch");

    expect(Sentry.captureException).toHaveBeenCalledWith(
      sensitiveDbError,
      expect.anything(),
    );
  });
});
