import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import type { Session } from "@/lib/auth/session";

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

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=13501");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limited", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as unknown as Session);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new NextRequest("http://localhost/api/weather?zip=13501");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });

  it("returns 400 for invalid zip code", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as unknown as Session);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/weather?zip=invalid");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 if no parameters provided", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as unknown as Session);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/weather");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Provide address, zip, or lat/lng");
  });
});
