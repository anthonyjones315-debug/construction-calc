import { describe, expect, it, vi, beforeEach } from "vitest";
import { PATCH, DELETE } from "@/app/api/command-center/members/[memberId]/route";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

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

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";
import type { AuthSession } from "@/lib/auth/session";
import type { BusinessContext } from "@/lib/supabase/business";

describe("Command Center Members API Security Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captures Sentry exception and returns generic 500 error when DB query fails during member lookup", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-123", email: "admin@example.com" },
      expires: "2030-01-01",
    } as unknown as AuthSession);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      userId: "admin-123",
      businessId: "biz-456",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    } as unknown as BusinessContext);

    const mockDb = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: {
                  message: "FATAL: database connection lost or invalid schema relation",
                  code: "08006",
                },
              }),
            }),
          }),
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost/api/command-center/members/mem-1", {
      method: "PATCH",
      body: JSON.stringify({ role: "member" }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ memberId: "mem-1" }),
    });

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Internal Server Error");
    expect(json.error).not.toContain("FATAL");
    expect(json.error).not.toContain("database connection");

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("FATAL"),
      }),
    );
  });

  it("captures Sentry exception and returns generic 500 error on DELETE when DB lookup fails", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-123", email: "admin@example.com" },
      expires: "2030-01-01",
    } as unknown as AuthSession);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      userId: "admin-123",
      businessId: "biz-456",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    } as unknown as BusinessContext);

    const mockDb = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: {
                  message: "PGERROR: relation memberships does not exist",
                  code: "42P01",
                },
              }),
            }),
          }),
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost/api/command-center/members/mem-1", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ memberId: "mem-1" }),
    });

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Internal Server Error");
    expect(json.error).not.toContain("relation memberships does not exist");

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("PGERROR"),
      }),
    );
  });
});
