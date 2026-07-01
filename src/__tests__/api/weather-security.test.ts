import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { getClientIp } from "@/lib/http/client-ip";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import type { Session } from "@/lib/auth/session";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

// Mock Sentry to avoid errors during tests
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((_, cb) => cb()),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(getClientIp).mockReturnValue("127.0.0.1");
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toMatch(/too many requests/i);
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("returns 401 when unauthorized", async () => {
    vi.mocked(getClientIp).mockReturnValue("127.0.0.1");
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("proceeds to logic when authenticated and not rate limited", async () => {
    vi.mocked(getClientIp).mockReturnValue("127.0.0.1");
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as Session);

    // We don't need to mock the full fetch chain for a security test,
    // just verify it doesn't return 401 or 429.
    // The handler will likely fail later due to missing env vars or fetch mock,
    // but that's fine for this test's scope.
    const req = new NextRequest("http://localhost/api/weather?zip=12345");

    // Silence console errors from the expected later failures
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await GET(req);

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(429);

    consoleSpy.mockRestore();
  });
});
