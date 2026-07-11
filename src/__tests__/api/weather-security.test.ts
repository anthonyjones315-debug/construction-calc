import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { NextRequest } from "next/server";

// Mock server-only to avoid import errors in tests
vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    (checkMemoryRateLimit as Mock).mockReturnValue({ ok: true });
    (auth as Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 when rate limited", async () => {
    (checkMemoryRateLimit as Mock).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });

  it("proceeds when authenticated and not rate limited", async () => {
    (checkMemoryRateLimit as Mock).mockReturnValue({ ok: true });
    (auth as Mock).mockResolvedValue({ user: { id: "user_123" } });

    // Mock fetch to prevent actual API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "OK", results: [] }),
    });

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    // It might still return 400 because of empty results, but it shouldn't be 401 or 429
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(429);
  });
});
