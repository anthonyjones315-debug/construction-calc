import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/contractor-profile/route";
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
  getTenantScopeColumn: vi.fn().mockReturnValue("user_id"),
  getTenantScopeId: vi.fn().mockReturnValue("user_123"),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("GET /api/contractor-profile security checks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when session user is missing", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns contractor profile when authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user_123", email: "contractor@example.com", name: "Contractor Name" },
    } as any);

    const mockDb = {
      from: vi.fn((table: string) => {
        if (table === "users") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { name: "John Doe", image: "https://example.com/avatar.png", email: "john@example.com" },
              error: null,
            }),
          };
        }
        if (table === "business_profiles") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                business_name: "Acme Builders",
                business_phone: "555-1234",
                business_email: "acme@example.com",
                business_address: "123 Main St",
                logo_url: "https://example.com/logo.png",
              },
              error: null,
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValueOnce({
      role: "owner",
      isOwner: true,
      businessId: null,
      usesLegacyUserScope: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      profile: {
        businessName: "Acme Builders",
        companyName: "Acme Builders",
        logoUrl: "https://example.com/logo.png",
        businessAddress: "123 Main St",
        businessPhone: "555-1234",
        businessEmail: "acme@example.com",
      },
    });
  });
});
