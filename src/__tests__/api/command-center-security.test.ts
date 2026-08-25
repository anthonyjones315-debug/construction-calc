import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH, DELETE } from "@/app/api/command-center/members/[memberId]/route";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

vi.mock("server-only", () => ({}));
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
}));

describe("Command Center Members API Security Hardening", () => {
  const dbQueryMock = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_owner_1" },
    });
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(dbQueryMock);
    (getBusinessContextForSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "user_owner_1",
      businessId: "biz_123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    });
  });

  it("returns generic 500 without leaking database error details on PATCH load failure", async () => {
    dbQueryMock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "relation memberships does not exist (SQL state 42P01)", code: "42P01" },
    });

    const req = new NextRequest("http://localhost/api/command-center/members/mem_1", {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ memberId: "mem_1" }) });
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Internal Server Error");
    expect(json.error).not.toContain("42P01");
    expect(json.error).not.toContain("memberships");
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it("returns generic 500 without leaking database error details on DELETE load failure", async () => {
    dbQueryMock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "fatal database socket error", code: "57P01" },
    });

    const req = new NextRequest("http://localhost/api/command-center/members/mem_1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ memberId: "mem_1" }) });
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Internal Server Error");
    expect(json.error).not.toContain("57P01");
    expect(json.error).not.toContain("socket");
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
