import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/estimates/signed-since/route";
import * as authConfig from "@/lib/auth/config";
import * as supabaseServer from "@/lib/supabase/server";
import * as supabaseBusiness from "@/lib/supabase/business";
import * as Sentry from "@sentry/nextjs";

vi.mock("@/lib/auth/config");
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/supabase/business");

describe("GET /api/estimates/signed-since security hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.spyOn(authConfig, "auth").mockResolvedValue(null as never);

    const req = new NextRequest("http://localhost/api/estimates/signed-since");
    const res = await GET(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("sanitizes database errors with generic 500 and captures exception in Sentry", async () => {
    vi.spyOn(authConfig, "auth").mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
      expires: "2099-01-01",
    } as never);

    vi.spyOn(supabaseBusiness, "getBusinessContextForSession").mockResolvedValue({
      userId: "user-123",
      businessId: "biz-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    });

    vi.spyOn(supabaseBusiness, "getTenantScopeColumn").mockReturnValue("business_id");
    vi.spyOn(supabaseBusiness, "getTenantScopeId").mockReturnValue("biz-123");

    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "FATAL: password authentication failed for user postgres", code: "28P01" },
      }),
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    vi.spyOn(supabaseServer, "createServerClient").mockReturnValue(mockSupabase as never);

    const req = new NextRequest("http://localhost/api/estimates/signed-since?since=2026-01-01T00:00:00.000Z");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");
    expect(body.error).not.toContain("postgres");
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("postgres") }),
    );
  });
});
