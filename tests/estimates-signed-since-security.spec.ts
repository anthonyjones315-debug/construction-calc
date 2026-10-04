import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/estimates/signed-since/route";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeColumn: vi.fn(() => "business_id"),
  getTenantScopeId: vi.fn(() => "biz-123"),
}));

describe("signed-since API security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const req = new NextRequest("http://localhost/api/estimates/signed-since");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns generic Internal Server Error on database query failure without leaking error details", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "user@example.com" },
    } as never);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      userId: "user-123",
      businessId: "biz-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    } as never);

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "pg_query_failed: sensitive database schema details exposed", code: "42P01" },
      }),
    };

    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue(mockChain),
    } as never);

    const req = new NextRequest("http://localhost/api/estimates/signed-since?since=2026-01-01T00:00:00.000Z");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Internal Server Error" });
    expect(json.error).not.toContain("sensitive database schema details exposed");
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
