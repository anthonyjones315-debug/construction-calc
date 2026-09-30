import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/estimates/signed-since/route";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

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

describe("GET /api/estimates/signed-since security and error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when no session is present", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as unknown as Awaited<ReturnType<typeof auth>>);

    const req = new NextRequest("http://localhost/api/estimates/signed-since");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("captures Sentry exception and returns generic 500 error when database query fails without leaking raw message", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "usr_123", email: "test@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as unknown as Awaited<ReturnType<typeof auth>>);

    vi.mocked(getBusinessContextForSession).mockResolvedValueOnce({
      userId: "usr_123",
      businessId: "biz_123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    });

    const mockDbError = {
      message: "relation \"saved_estimates\" does not exist or invalid column PG error 42P01",
      code: "42P01",
    };

    const mockSelectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: null, error: mockDbError }),
    };

    vi.mocked(createServerClient).mockReturnValueOnce({
      from: vi.fn().mockReturnValue(mockSelectChain),
    } as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost/api/estimates/signed-since?since=2026-01-01T00:00:00.000Z");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(body.error).not.toContain("42P01");
    expect(body.error).not.toContain("saved_estimates");
    expect(Sentry.captureException).toHaveBeenCalledWith(mockDbError);
  });
});
