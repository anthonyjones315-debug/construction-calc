import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/estimates/[id]/regen-share/route";
import { NextRequest } from "next/server";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  canWriteBusinessData: vi.fn(),
  getBusinessContextForSession: vi.fn(),
  getTenantScopeColumn: vi.fn().mockReturnValue("business_id"),
  getTenantScopeId: vi.fn().mockReturnValue("biz-123"),
}));

vi.mock("@/lib/supabase/estimate-scope", () => ({
  loadEstimateScope: vi.fn(),
}));

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { canWriteBusinessData, getBusinessContextForSession } from "@/lib/supabase/business";
import { loadEstimateScope } from "@/lib/supabase/estimate-scope";
import * as Sentry from "@sentry/nextjs";

describe("POST /api/estimates/[id]/regen-share security", () => {
  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const req = new NextRequest("http://localhost/api/estimates/est-123/regen-share", {
      method: "POST",
    });

    const response = await POST(req, { params: Promise.resolve({ id: "est-123" }) });
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 Forbidden for users without write permission", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-123" } } as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValueOnce({ role: "member" } as any);
    vi.mocked(canWriteBusinessData).mockReturnValueOnce(false);

    const req = new NextRequest("http://localhost/api/estimates/est-123/regen-share", {
      method: "POST",
    });

    const response = await POST(req, { params: Promise.resolve({ id: "est-123" }) });
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toMatch(/only owners, admins, or editors/i);
  });

  it("captures database errors with Sentry and returns generic 500 without leaking details", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-123" } } as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValueOnce({ role: "owner" } as any);
    vi.mocked(canWriteBusinessData).mockReturnValueOnce(true);
    vi.mocked(loadEstimateScope).mockResolvedValueOnce({ ok: true, status: 200 } as any);

    const rawDbError = { message: "pg_query_error: relation saved_estimates does not exist", code: "42P01" };
    const mockDb = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: rawDbError,
              }),
            }),
          }),
        }),
      }),
    };
    vi.mocked(createServerClient).mockReturnValueOnce(mockDb as any);

    const req = new NextRequest("http://localhost/api/estimates/est-123/regen-share", {
      method: "POST",
    });

    const response = await POST(req, { params: Promise.resolve({ id: "est-123" }) });
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe("Internal Server Error");
    expect(data.error).not.toContain("pg_query_error");
    expect(data.error).not.toContain("saved_estimates");
    expect(Sentry.captureException).toHaveBeenCalledWith(rawDbError);
  });
});
