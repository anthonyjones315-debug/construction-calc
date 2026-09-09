import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET } from "@/app/api/health/db/route";
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
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("/api/health/db security tests", () => {
  it("returns 401 Unauthorized when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 Forbidden when user is not a business owner", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "member-1" },
    } as any);

    vi.mocked(createServerClient).mockReturnValue({} as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValueOnce({
      isOwner: false,
      role: "member",
    } as any);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json).toEqual({
      error: "Only business owners can access database diagnostics.",
    });
  });

  it("sanitizes database error messages when query fails", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "owner-1" },
    } as any);

    const mockDb = {
      schema: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            error: {
              code: "PGRST123",
              message: "FATAL: password authentication failed for user 'postgres'",
            },
            count: null,
          }),
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValueOnce({
      isOwner: true,
      role: "owner",
    } as any);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(false);
    expect(json.tables).toBeDefined();

    for (const tableItem of json.tables) {
      expect(tableItem.error).toBe("Database check failed");
      expect(tableItem.error).not.toContain("FATAL");
      expect(tableItem.error).not.toContain("postgres");
    }
  });
});
