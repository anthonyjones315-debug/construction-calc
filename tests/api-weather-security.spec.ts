import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { getClientIp } from "@/lib/http/client-ip";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(),
}));

// Mock Sentry to avoid errors during tests
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(getClientIp).mockReturnValue("127.0.0.1");
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toMatch(/too many requests/i);
  });

  it("proceeds if authenticated and within rate limits", async () => {
    // We only want to test the security guards, so we mock them to pass
    // and then expect it to fail further down (e.g. because of missing env vars)
    // or we can mock the rest if we want a full success test, but here we focus on security.
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(getClientIp).mockReturnValue("127.0.0.1");
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new Request("http://localhost/api/weather?zip=13502");

    // It will likely fail later due to missing GOOGLE_MAPS_API_KEY in test env
    // but we check that it didn't fail with 401 or 429.
    const res = await GET(req);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(429);
  });
});
