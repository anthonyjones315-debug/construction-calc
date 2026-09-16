import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, PUT } from "@/app/api/materials/[id]/route";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

const mockAuth = vi.fn();
vi.mock("@/lib/auth/config", () => ({
  auth: () => mockAuth(),
}));

const mockGetBusinessContextForSession = vi.fn();
vi.mock("@/lib/supabase/business", () => ({
  canWriteBusinessData: (role: string) => ["owner", "admin", "editor"].includes(role),
  getBusinessContextForSession: (...args: unknown[]) => mockGetBusinessContextForSession(...args),
  getTenantScopeColumn: (ctx: { usesLegacyUserScope: boolean }) =>
    ctx.usesLegacyUserScope ? "user_id" : "business_id",
  getTenantScopeId: (ctx: { usesLegacyUserScope: boolean; userId: string; businessId: string }) =>
    ctx.usesLegacyUserScope ? ctx.userId : ctx.businessId,
}));

const mockDbDelete = vi.fn();
const mockDbUpdate = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (table: string) => {
      if (table !== "user_materials") throw new Error("Unexpected table");
      return {
        delete: () => mockDbDelete(),
        update: (data: unknown) => mockDbUpdate(data),
      };
    },
  }),
}));

describe("Materials API Security (/api/materials/[id])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DELETE /api/materials/[id]", () => {
    it("returns 401 when user is unauthenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost/api/materials/mat_123", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: "mat_123" }) });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 403 when user does not have canDeleteBusinessData permission", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user_member" } });
      mockGetBusinessContextForSession.mockResolvedValueOnce({
        userId: "user_member",
        businessId: "biz_123",
        role: "member",
        canDeleteBusinessData: false,
        usesLegacyUserScope: false,
      });

      const req = new NextRequest("http://localhost/api/materials/mat_123", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: "mat_123" }) });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("Only business owners or admins can delete");
    });

    it("returns 404 when material is not found or belongs to another tenant", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user_admin" } });
      mockGetBusinessContextForSession.mockResolvedValueOnce({
        userId: "user_admin",
        businessId: "biz_123",
        role: "admin",
        canDeleteBusinessData: true,
        usesLegacyUserScope: false,
      });

      const mockQueryChain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
      };
      mockDbDelete.mockReturnValueOnce(mockQueryChain);

      const req = new NextRequest("http://localhost/api/materials/mat_999", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: "mat_999" }) });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Material not found");
    });

    it("returns 200 { ok: true } on successful deletion of owned material", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user_owner" } });
      mockGetBusinessContextForSession.mockResolvedValueOnce({
        userId: "user_owner",
        businessId: "biz_123",
        role: "owner",
        canDeleteBusinessData: true,
        usesLegacyUserScope: false,
      });

      const mockQueryChain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({ data: { id: "mat_123" }, error: null }),
      };
      mockDbDelete.mockReturnValueOnce(mockQueryChain);

      const req = new NextRequest("http://localhost/api/materials/mat_123", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: "mat_123" }) });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
    });
  });

  describe("PUT /api/materials/[id]", () => {
    it("returns 404 when updating non-existent or cross-tenant material", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user_editor" } });
      mockGetBusinessContextForSession.mockResolvedValueOnce({
        userId: "user_editor",
        businessId: "biz_123",
        role: "editor",
        usesLegacyUserScope: false,
      });

      const mockQueryChain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
      };
      mockDbUpdate.mockReturnValueOnce(mockQueryChain);

      const req = new NextRequest("http://localhost/api/materials/mat_999", {
        method: "PUT",
        body: JSON.stringify({ material_name: "Updated Name", unit_cost: 45 }),
      });
      const res = await PUT(req, { params: Promise.resolve({ id: "mat_999" }) });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Material not found");
    });
  });
});
