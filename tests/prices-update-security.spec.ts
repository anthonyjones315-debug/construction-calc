import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/prices/update/route";
import * as authConfig from "@/lib/auth/config";
import * as supabaseServer from "@/lib/supabase/server";
import * as supabaseBusiness from "@/lib/supabase/business";
import * as Sentry from "@sentry/nextjs";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeColumn: vi.fn(),
  getTenantScopeId: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("POST /api/prices/update Security", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 Unauthorized when session is missing or unauthenticated", async () => {
    vi.mocked(authConfig.auth).mockResolvedValue(null as any);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns merged prices when authenticated", async () => {
    const mockSession = { user: { id: "user-123" } };
    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any);

    const mockBusinessContext = {
      userId: "user-123",
      businessId: "biz-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    };
    vi.mocked(supabaseBusiness.getBusinessContextForSession).mockResolvedValue(mockBusinessContext as any);
    vi.mocked(supabaseBusiness.getTenantScopeColumn).mockReturnValue("business_id");
    vi.mocked(supabaseBusiness.getTenantScopeId).mockReturnValue("biz-123");

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { material_name: "Custom Concrete", unit_type: "sq ft", unit_cost: 15.5 },
      ],
      error: null,
    });
    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    vi.mocked(supabaseServer.createServerClient).mockReturnValue({
      from: mockFrom,
    } as any);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.prices["Custom Concrete"]).toEqual({
      price: 15.5,
      unit: "sq ft",
    });
    expect(mockFrom).toHaveBeenCalledWith("user_materials");
    expect(mockSelect).toHaveBeenCalledWith("material_name, unit_type, unit_cost");
    expect(mockEq).toHaveBeenCalledWith("business_id", "biz-123");
  });

  it("handles database errors securely and logs with Sentry", async () => {
    const mockSession = { user: { id: "user-123" } };
    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any);

    const mockBusinessContext = {
      userId: "user-123",
      businessId: "biz-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    };
    vi.mocked(supabaseBusiness.getBusinessContextForSession).mockResolvedValue(mockBusinessContext as any);
    vi.mocked(supabaseBusiness.getTenantScopeColumn).mockReturnValue("business_id");
    vi.mocked(supabaseBusiness.getTenantScopeId).mockReturnValue("biz-123");

    const mockEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Internal DB secret disclosure prevention" },
    });
    const mockSelect = vi.fn().mockReturnThis();
    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    vi.mocked(supabaseServer.createServerClient).mockReturnValue({
      from: mockFrom,
    } as any);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: "Internal Server Error" });
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
