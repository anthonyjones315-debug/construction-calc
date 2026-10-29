import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "@/app/api/business-profile/route";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

vi.mock("next/cache", () => ({
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeColumn: vi.fn().mockReturnValue("business_id"),
  getTenantScopeId: vi.fn().mockReturnValue("biz-123"),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("PATCH /api/business-profile security & validation", () => {
  const updateMock = vi.fn().mockReturnThis();
  const eqMock = vi.fn().mockResolvedValue({ error: null });

  beforeEach(() => {
    vi.clearAllMocks();
    updateMock.mockReturnValue({ eq: eqMock });

    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "owner-123", email: "owner@example.com" },
    });

    (getBusinessContextForSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "owner-123",
      businessId: "biz-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    });

    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: updateMock,
      }),
    });
  });

  it("truncates oversized field inputs to max lengths", async () => {
    const longString = "A".repeat(1000);
    const req = new NextRequest("http://localhost/api/business-profile", {
      method: "PATCH",
      body: JSON.stringify({
        business_name: longString,
        business_phone: longString,
        business_tax_id: longString,
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    expect(updateMock).toHaveBeenCalledWith({
      business_name: "A".repeat(200),
      business_phone: "A".repeat(50),
      business_tax_id: "A".repeat(100),
    });
  });

  it("rejects unauthenticated PATCH requests", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/business-profile", {
      method: "PATCH",
      body: JSON.stringify({ business_name: "New Name" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("rejects non-owner PATCH requests", async () => {
    (getBusinessContextForSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "member-123",
      businessId: "biz-123",
      role: "member",
      isOwner: false,
      isAdmin: false,
      canWriteBusinessData: false,
      canDeleteBusinessData: false,
      usesLegacyUserScope: false,
    });

    const req = new NextRequest("http://localhost/api/business-profile", {
      method: "PATCH",
      body: JSON.stringify({ business_name: "New Name" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(403);
  });
});
