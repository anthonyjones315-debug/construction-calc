import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((_opts, cb) => cb()),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-123", email: "owner@example.com" },
  }),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn().mockResolvedValue({
    userId: "user-123",
    businessId: "biz-456",
    role: "owner",
    isOwner: true,
    usesLegacyUserScope: false,
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockReturnValue({
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Internal S3 permission error: bucket secret_key_db_info" },
        }),
      }),
    },
  }),
}));

describe("POST /api/business-profile/logo security", () => {
  it("hides raw storage error messages and returns a generic reference error on storage failure", async () => {
    const { POST } = await import("@/app/api/business-profile/logo/route");

    const formData = new FormData();
    const mockFile = new File(["dummy-image-content"], "logo.png", { type: "image/png" });
    formData.append("logo", mockFile);

    const req = new NextRequest("http://localhost:3000/api/business-profile/logo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toMatch(/^Upload failed\. \(ref: [0-9a-f-]+\)$/);
    expect(json.error).not.toContain("secret_key_db_info");
    expect(json.error).not.toContain("Internal S3 permission error");
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
