import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
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

    const req = new Request("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new Request("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toMatch(/rate limit exceeded/i);
  });

  it("sanitizes error messages on internal failure", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Trigger an error by not providing any params which causes the route to try to parse URL of a malformed request or similar
    // Actually, I'll just mock something to throw
    vi.mocked(auth).mockRejectedValue(new Error("Database exploded!!! Internal secret path: /etc/passwd"));

    const req = new Request("http://localhost/api/weather");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Weather data unavailable");
    expect(data.error).not.toContain("Database exploded");
  });
});
