import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthorized", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/weather?zip=13413");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1", name: null, email: null, image: null } });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new NextRequest("http://localhost/api/weather?zip=13413");
    const res = await GET(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toMatch(/too many requests/i);
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("returns 500 with sanitized message on internal error", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1", name: null, email: null, image: null } });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Trigger an error by passing a request that will fail URL parsing or something else internal
    // Or we can mock something deeper to throw.
    // Let's mock Request.url getter to throw.
    const req = new NextRequest("http://localhost/api/weather?zip=13413");
    Object.defineProperty(req, 'url', { get: () => { throw new Error("Database Down"); } });

    const res = await GET(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal Server Error");
    expect(data.error).not.toContain("Database Down");
  });
});
