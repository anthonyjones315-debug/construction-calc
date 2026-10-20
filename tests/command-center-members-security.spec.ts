import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH, DELETE } from "@/app/api/command-center/members/[memberId]/route";
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
}));

describe("Command Center Members API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not disclose raw database error details on PATCH loadTargetMembership failure", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "owner-123" },
      expires: "2099-01-01",
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      isAdmin: true,
      isOwner: true,
      businessId: "biz-123",
      userId: "owner-123",
      role: "owner",
    } as any);

    const mockDb = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "fatal: connection to server at 127.0.0.1 failed", code: "08006" },
              }),
            }),
          }),
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb as any);

    const req = new NextRequest("http://localhost/api/command-center/members/mem-1", {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ memberId: "mem-1" }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(data.error).not.toContain("127.0.0.1");
    expect(data.error).not.toContain("08006");
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("127.0.0.1") })
    );
  });

  it("does not disclose raw database error details on DELETE loadTargetMembership failure", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "owner-123" },
      expires: "2099-01-01",
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      isAdmin: true,
      isOwner: true,
      businessId: "biz-123",
      userId: "owner-123",
      role: "owner",
    } as any);

    const mockDb = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "permission denied for table memberships", code: "42501" },
              }),
            }),
          }),
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb as any);

    const req = new NextRequest("http://localhost/api/command-center/members/mem-1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ memberId: "mem-1" }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(data.error).not.toContain("permission denied");
    expect(data.error).not.toContain("42501");
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("permission denied") })
    );
  });
});
