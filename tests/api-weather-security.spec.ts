import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock server-only before importing modules that use it
vi.mock("server-only", () => ({}));

import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { getClientIp } from "@/lib/http/client-ip";
import { isPrerenderHeadersAccessError } from "@/lib/next/prerender";

vi.mock("@/lib/auth/config");
vi.mock("@/lib/rate-limit/memory");
vi.mock("@/lib/http/client-ip");
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientIp).mockReturnValue("127.0.0.1");
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
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
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new Request("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });

  it("throws during prerendering headers access error to bail out of static generation", async () => {
    vi.mocked(auth).mockImplementation(async () => {
      const err = new Error("Error during prerendering headers() rejects");
      (err as any).digest = "HANGING_PROMISE_REJECTION";
      throw err;
    });

    const req = new Request("http://localhost/api/weather?zip=12345");

    // In Next.js, this error must propagate to trigger bail-out
    // We expect GET to throw the error
    try {
      await GET(req);
      throw new Error("Should have thrown");
    } catch (err: any) {
      expect(err.message).toMatch(/prerendering/i);
      expect(err.digest).toBe("HANGING_PROMISE_REJECTION");
    }
  });

  it("proceeds if authenticated and not rate limited", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "mock-key";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);

    // Mocking the fetch to Google/Open-Meteo to prevent actual network calls
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ status: "ZERO_RESULTS" }), // Just to fail later in the logic
    });
    global.fetch = mockFetch;

    const req = new Request("http://localhost/api/weather?zip=12345");
    // Ensure we have a zip so it enters the geocoding logic
    const res = await GET(req);

    // Should get past auth/rate limit and fail at geocoding (400)
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Failed to geocode zip");
  });
});
