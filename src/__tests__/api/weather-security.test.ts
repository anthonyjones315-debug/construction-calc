import { describe, it, expect, vi, beforeEach } from "vitest";
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

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// Mock server-only to prevent errors in Vitest
vi.mock("server-only", () => ({}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if not authenticated", async () => {
    (auth as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=90210");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit exceeded", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user_123" } });
    (checkMemoryRateLimit as any).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/weather?zip=90210");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });

  it("returns 400 for invalid zip code", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user_123" } });
    (checkMemoryRateLimit as any).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/weather?zip=invalid");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 if no parameters provided", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user_123" } });
    (checkMemoryRateLimit as any).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/weather");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Provide address, zip, or lat/lng");
  });
});
