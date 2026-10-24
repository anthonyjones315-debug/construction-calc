import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/prices/update/route";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeColumn: vi.fn(() => "business_id"),
  getTenantScopeId: vi.fn(() => "biz-123"),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

describe("POST /api/prices/update security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when no session exists", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 Unauthorized when session user ID is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: {} } as any);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 OK with custom user materials when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "contractor@example.com" },
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      userId: "user-123",
      businessId: "biz-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    });

    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { material_name: "2x4 Lumber 8ft", unit_type: "each", unit_cost: 7.5 },
      ],
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    vi.mocked(createServerClient).mockReturnValue({
      from: mockFrom,
    } as any);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.prices["2x4 Lumber 8ft"]).toEqual({
      price: 7.5,
      unit: "each",
    });
  });

  it("returns generic 500 Internal Server Error when database fails", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "contractor@example.com" },
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      userId: "user-123",
      businessId: "biz-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    });

    const mockEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database connection failed", code: "50000" },
    });

    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    vi.mocked(createServerClient).mockReturnValue({
      from: mockFrom,
    } as any);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Internal Server Error" });
  });
});
