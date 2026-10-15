import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/db/route";

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

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

describe("GET /api/health/db security", () => {
  it("returns generic 'Database check failed' message when a table query produces an error", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "owner-1", email: "owner@example.com" },
      expires: "2099-01-01",
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      isOwner: true,
      businessId: "biz-1",
      usesLegacyUserScope: false,
    } as any);

    const mockFrom = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockImplementation(() => ({
        limit: vi.fn().mockResolvedValue({
          error: { message: "fatal: relation 'users' does not exist at pg_catalog" },
          count: null,
        }),
      })),
    }));

    vi.mocked(createServerClient).mockReturnValue({
      from: mockFrom,
      schema: vi.fn().mockReturnValue({
        from: mockFrom,
      }),
    } as any);

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.tables).toBeDefined();
    expect(body.tables.length).toBeGreaterThan(0);

    for (const tableCheck of body.tables) {
      if (!tableCheck.ok) {
        expect(tableCheck.error).toBe("Database check failed");
        expect(tableCheck.error).not.toContain("relation");
        expect(tableCheck.error).not.toContain("pg_catalog");
      }
    }
  });
});
