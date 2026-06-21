import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
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

vi.mock("server-only", () => ({}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new Request("http://localhost/api/weather?zip=78701");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1" } } as unknown as Session);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new Request("http://localhost/api/weather?zip=78701");
    const res = await GET(req);

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe("Too many requests. Please wait a moment before trying again.");
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("allows request if authenticated and within rate limit", async () => {
    // This will likely fail until we mock the fetch for Google/Open-Meteo or if we just want to check it passed the auth/rl guards
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1" } } as unknown as Session);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Mock fetch to avoid actual network calls
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "OK", results: [] }), // minimal mock
      })
    );

    const req = new Request("http://localhost/api/weather?zip=78701");
    const res = await GET(req);

    // We expect it to at least get past 401 and 429
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(429);
  });
});
