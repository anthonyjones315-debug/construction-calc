import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { POST } from "@/app/api/estimates/[id]/regen-share/route";

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
  canWriteBusinessData: vi.fn(() => true),
  getBusinessContextForSession: vi.fn(() => ({ role: "owner" })),
  getTenantScopeColumn: vi.fn(() => "user_id"),
  getTenantScopeId: vi.fn(() => "user-123"),
}));

vi.mock("@/lib/supabase/estimate-scope", () => ({
  loadEstimateScope: vi.fn(() => ({ ok: true })),
}));

import { createServerClient } from "@/lib/supabase/server";

describe("POST /api/estimates/[id]/regen-share security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/estimates/est-123/regen-share", {
      method: "POST",
    });

    const response = await POST(req, { params: Promise.resolve({ id: "est-123" }) });
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns generic 500 and captures exception in Sentry when database error occurs fetching estimate", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "user@example.com" },
      expires: "2099-01-01",
    });

    const mockDb = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "fatal db connection error: password failed" },
              }),
            }),
          }),
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost/api/estimates/est-123/regen-share", {
      method: "POST",
    });

    const response = await POST(req, { params: Promise.resolve({ id: "est-123" }) });
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(body.error).not.toContain("fatal db connection error");

    expect(Sentry.captureException).toHaveBeenCalledWith({
      message: "fatal db connection error: password failed",
    });
  });
});
