import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/estimates/signed-since/route";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));
vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeColumn: vi.fn().mockReturnValue("business_id"),
  getTenantScopeId: vi.fn().mockReturnValue("biz_123"),
}));
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Signed Since Estimates API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const req = new NextRequest("http://localhost:3000/api/estimates/signed-since");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("sanitizes database query errors and returns generic 500 without leaking raw details", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user_123" },
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValueOnce({
      businessId: "biz_123",
      role: "owner",
    } as any);

    const sensitiveErrorMessage = "PG::Error: column saved_estimates.secret_key does not exist at position 42";

    const mockDb = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: sensitiveErrorMessage },
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb as any);

    const req = new NextRequest("http://localhost:3000/api/estimates/signed-since?since=2026-01-01T00:00:00.000Z");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(json)).not.toContain(sensitiveErrorMessage);
  });
});
