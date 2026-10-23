import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { PATCH, DELETE } from "@/app/api/command-center/members/[memberId]/route";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-123", email: "owner@example.com" },
  }),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn().mockResolvedValue({
    userId: "user-123",
    businessId: "biz-456",
    role: "owner",
    isOwner: true,
    isAdmin: true,
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "fatal postgres error: syntax or connection issue" },
            }),
          }),
        }),
      }),
    }),
  }),
}));

describe("command-center members API security", () => {
  it("hides raw database error message and captures Sentry exception on PATCH", async () => {
    vi.clearAllMocks();
    const req = new NextRequest("http://localhost/api/command-center/members/mem-123", {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ memberId: "mem-123" }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
    expect(data.error).not.toContain("fatal postgres error");
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it("hides raw database error message and captures Sentry exception on DELETE", async () => {
    vi.clearAllMocks();
    const req = new NextRequest("http://localhost/api/command-center/members/mem-123", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ memberId: "mem-123" }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
    expect(data.error).not.toContain("fatal postgres error");
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});
