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

  it("blocks unauthorized requests", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("applies rate limiting", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user_1" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValueOnce({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const body = await res.json();
    expect(body.error).toMatch(/too many requests/i);
  });

  it("returns generic error on failure", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "fake_key";
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user_1" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValueOnce({ ok: true });

    // Mocking URL to throw error during searchParams access or something similar
    // is tricky, let's just make fetch fail
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Sensitive DB error"));

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");
    expect(body.error).not.toBe("Sensitive DB error");
  });
});
