import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/business-profile/logo/route";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn().mockResolvedValue({
    isOwner: true,
    usesLegacyUserScope: true,
    businessId: "biz-123",
  }),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("POST /api/business-profile/logo security tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 500 with generic error message on storage failure without disclosing error details", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "owner@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as any);

    const mockUpload = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Internal Bucket Secret Failure: s3://private-bucket-name/xyz" },
    });

    const mockFrom = vi.fn().mockReturnValue({
      upload: mockUpload,
    });

    vi.mocked(createServerClient).mockReturnValue({
      storage: {
        from: mockFrom,
      },
    } as any);

    const formData = new FormData();
    const file = new File(["dummy content"], "logo.png", { type: "image/png" });
    formData.append("logo", file);

    const req = new NextRequest("http://localhost/api/business-profile/logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to upload logo.");
    expect(JSON.stringify(body)).not.toContain("Internal Bucket Secret Failure");
    expect(JSON.stringify(body)).not.toContain("s3://");
  });
});
