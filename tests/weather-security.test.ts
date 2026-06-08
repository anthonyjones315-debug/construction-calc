import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import type { Session } from "@/lib/auth/session";

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
  captureMessage: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=10001");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    const mockSession: Session = { user: { id: "user_123" } };
    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
      limit: 20,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const req = new NextRequest("http://localhost/api/weather?zip=10001");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const body = await res.json();
    expect(body.error).toContain("Too many requests");
  });

  it("returns 500 with generic message on internal error", async () => {
    const mockSession: Session = { user: { id: "user_123" } };
    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60000,
    });

    vi.mocked(auth).mockRejectedValue(new Error("Database connection failed"));

    const req = new NextRequest("http://localhost/api/weather?zip=10001");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");
    expect(JSON.stringify(body)).not.toContain("Database connection failed");
  });
});
