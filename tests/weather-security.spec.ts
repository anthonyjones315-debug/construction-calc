import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

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

  it("returns 401 if unauthorized", async () => {
    (auth as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=13421");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limited", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user-1" } });
    (checkMemoryRateLimit as any).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new NextRequest("http://localhost/api/weather?zip=13421");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const body = await res.json();
    expect(body.error).toBe("Too many requests");
  });

  it("returns 500 with sanitized message on internal error", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user-1" } });
    (checkMemoryRateLimit as any).mockReturnValue({ ok: true });

    // Trigger an error by not providing a google key or anything that would fail early
    // Or just mock something to throw
    vi.spyOn(URL.prototype, 'searchParams', 'get').mockImplementation(() => {
        throw new Error("Secret database leak!");
    });

    const req = new NextRequest("http://localhost/api/weather?zip=13421");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");
    expect(body.error).not.toContain("Secret database leak!");
  });
});
