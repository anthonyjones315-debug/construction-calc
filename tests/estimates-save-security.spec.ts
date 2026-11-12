import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/estimates/save/route";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => ({
    schema: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("@/lib/supabase/business", () => ({
  assertNoBusinessIdOverride: vi.fn(),
  getBusinessContextForSession: vi.fn().mockResolvedValue({
    userId: "test-user-1",
    businessId: "test-biz-1",
    role: "owner",
    usesLegacyUserScope: false,
  }),
  getTenantScopeId: vi.fn().mockReturnValue("test-biz-1"),
  getTenantScopeColumn: vi.fn().mockReturnValue("business_id"),
}));

vi.mock("@/lib/estimates/name-generator", () => ({
  generateAutoEstimateName: vi.fn().mockResolvedValue("Auto Estimate Name"),
}));

vi.mock("@/app/actions/calculations", () => ({
  verifyEstimate: vi.fn().mockReturnValue({
    verified_county: "Oneida",
    verification_status: "VERIFIED",
  }),
  saveCalculation: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn(() => ({
    capture: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { auth } from "@/lib/auth/config";
import { saveCalculation } from "@/app/actions/calculations";

describe("POST /api/estimates/save security hardening", () => {
  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/estimates/save", {
      method: "POST",
      body: JSON.stringify({ name: "Draft Estimate" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("masks database errors with generic 500 without leaking raw SQL or schema details", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "contractor@example.com", name: "Contractor" },
      expires: "9999-12-31",
    } as any);

    vi.mocked(saveCalculation).mockResolvedValueOnce({
      data: null,
      error: {
        message: "relation saved_estimates table foreign key constraint users_id_fkey violated",
        code: "23503",
      } as any,
      correctedData: undefined,
    });

    const req = new NextRequest("http://localhost/api/estimates/save", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Remodel",
        calculator_id: "interior/paint",
        total_cost: 1500,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();

    expect(body.error).toBe("Internal Server Error");
    expect(JSON.stringify(body)).not.toContain("saved_estimates");
    expect(JSON.stringify(body)).not.toContain("users_id_fkey");
    expect(JSON.stringify(body)).not.toContain("foreign key");
    expect(JSON.stringify(body)).not.toContain("schema mismatch");
    expect(JSON.stringify(body)).not.toContain("supabase.co");
  });

  it("returns generic 500 when estimate insert returns no id", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "contractor@example.com", name: "Contractor" },
      expires: "9999-12-31",
    } as any);

    vi.mocked(saveCalculation).mockResolvedValueOnce({
      data: null,
      error: null,
      correctedData: undefined,
    });

    const req = new NextRequest("http://localhost/api/estimates/save", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Remodel",
        calculator_id: "interior/paint",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");
    expect(JSON.stringify(body)).not.toContain("missing estimate id");
  });
});
