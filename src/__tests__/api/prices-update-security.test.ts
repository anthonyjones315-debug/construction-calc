import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/prices/update/route";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn().mockResolvedValue({
    businessId: "test-biz-id",
    role: "owner",
    isOwner: true,
    usesLegacyUserScope: false,
  }),
  getTenantScopeColumn: vi.fn().mockReturnValue("business_id"),
  getTenantScopeId: vi.fn().mockReturnValue("test-biz-id"),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

describe("POST /api/prices/update Security Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 with prices for authenticated users", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
      expires: "2099-01-01",
    });

    const mockSelect = vi.fn().mockResolvedValue({
      data: [
        { material_name: "2x4 Lumber", unit_type: "each", unit_cost: 4.5 },
      ],
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { material_name: "2x4 Lumber", unit_type: "each", unit_cost: 4.5 },
          ],
          error: null,
        }),
      }),
    });

    vi.mocked(createServerClient).mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof createServerClient>);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.prices).toBeDefined();
    expect(json.prices["2x4 Lumber"]).toEqual({
      price: 4.5,
      unit: "each",
    });
  });
});
