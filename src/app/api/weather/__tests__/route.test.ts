import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/config");
vi.mock("@/lib/rate-limit/memory");
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
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

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("returns 500 with sanitized error message on internal failure", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Trigger an error by making URL parsing fail or similar,
    // but easier to mock Request.url to throw
    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    vi.spyOn(req, 'url', 'get').mockImplementation(() => {
        throw new Error("Sensitive database error");
    });

    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal Server Error");
    expect(data.error).not.toContain("Sensitive database error");
  });
});
