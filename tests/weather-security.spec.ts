import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn().mockReturnValue({ ok: true }),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  startSpan: vi.fn().mockImplementation((_, cb) => cb()),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use a basic mock for fetch
    global.fetch = vi.fn();

    // Default mock for checkMemoryRateLimit to be ok
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
  });

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new Request("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new Request("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("returns generic 500 error on failure", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // In the route, it first tries to parse the URL.
    // We can mock Request.url to throw if we want to hit the catch block VERY early.
    const req = new Request("http://localhost/api/weather?zip=12345");
    Object.defineProperty(req, 'url', {
      get: () => { throw new Error("Sensitive info leak!"); }
    });

    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal Server Error");
    expect(data.error).not.toContain("Sensitive");
  });
});
