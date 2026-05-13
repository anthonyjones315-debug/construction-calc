import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/materials/route";
import { NextRequest } from "next/server";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: "user-123" } })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
    })),
  })),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(() => Promise.resolve({
    businessId: "biz-123",
    usesLegacyUserScope: false,
  })),
  getTenantScopeColumn: vi.fn(() => "business_id"),
  getTenantScopeId: vi.fn(() => "biz-123"),
  assertNoBusinessIdOverride: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

describe("Materials API Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET should return 429 when rate limit is exceeded", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/materials");
    const res = await GET(req);

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("Too many requests");
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("POST should return 429 when rate limit is exceeded", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 30,
    });

    const req = new NextRequest("http://localhost/api/materials", {
      method: "POST",
      body: JSON.stringify({ material_name: "Test" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("Too many requests");
    expect(res.headers.get("Retry-After")).toBe("30");
  });

  it("GET should proceed when rate limit is not exceeded", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/materials");
    const res = await GET(req);

    expect(res.status).toBe(200);
  });
});
