import { vi, describe, expect, it, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/business-profile/logo/route";
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

// Mock next/cache to prevent "revalidateTag must be called in Next.js" error
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheTag: vi.fn(),
}));

// Mock Sentry to avoid noise/errors during tests
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Business Logo Upload Security & Extensions", () => {
  let mockDb: any;
  let mockStorageBucket: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStorageBucket = {
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: "https://example.com/storage/biz-123/logo.png" },
      }),
    };

    mockDb = {
      storage: {
        from: vi.fn().mockReturnValue(mockStorageBucket),
      },
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockDb);
  });

  const createRequest = (file: File | null) => {
    const formData = new FormData();
    if (file) {
      formData.append("logo", file);
    }
    return new NextRequest("http://localhost/api/business-profile/logo", {
      method: "POST",
      body: formData,
    });
  };

  it("returns 401 if user is unauthorized", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = createRequest(new File(["abc"], "logo.png", { type: "image/png" }));
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 if user is not business owner", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      isOwner: false,
      role: "member",
      usesLegacyUserScope: false,
      businessId: "biz-123",
    } as any);

    const req = createRequest(new File(["abc"], "logo.png", { type: "image/png" }));
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 for unallowed MIME types", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      isOwner: true,
      role: "owner",
      usesLegacyUserScope: false,
      businessId: "biz-123",
    } as any);

    const req = createRequest(new File(["abc"], "malicious.html", { type: "text/html" }));
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Please upload a PNG, JPG, WebP, SVG, or GIF/i);
  });

  it("safely resolves extension for image/png even if file name tries path traversal", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      isOwner: true,
      role: "owner",
      usesLegacyUserScope: false,
      businessId: "biz-123",
    } as any);

    // Provide a malicious path-traversal filename
    const maliciousFile = new File(["abc"], "../../../../evil.png", { type: "image/png" });
    const req = createRequest(maliciousFile);
    const res = await POST(req);

    const json = await res.json();
    if (res.status !== 200) {
      console.log("Error response body:", json);
    }

    expect(res.status).toBe(200);

    // Confirm upload path uses standard mapped extension and businessId prefix, not traversing any paths
    expect(mockDb.storage.from).toHaveBeenCalledWith("business_logos");
    expect(mockStorageBucket.upload).toHaveBeenCalledWith(
      "biz-123/logo.png",
      expect.any(Buffer),
      { upsert: true, contentType: "image/png" }
    );
  });

  it("safely resolves jpeg to jpg extension", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      isOwner: true,
      role: "owner",
      usesLegacyUserScope: false,
      businessId: "biz-123",
    } as any);

    const jpegFile = new File(["abc"], "my-logo.jpeg", { type: "image/jpeg" });
    const req = createRequest(jpegFile);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockStorageBucket.upload).toHaveBeenCalledWith(
      "biz-123/logo.jpg",
      expect.any(Buffer),
      { upsert: true, contentType: "image/jpeg" }
    );
  });
});
