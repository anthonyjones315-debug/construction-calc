import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

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
  it("returns 401 if unauthorized", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new Request("http://localhost/api/weather?zip=13501");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limited", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", name: null, email: null, image: null } });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });
    const req = new Request("http://localhost/api/weather?zip=13501");
    const res = await GET(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toBe("Too many requests");
  });

  it("returns 500 with generic error if internal error occurs", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", name: null, email: null, image: null } });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Trigger error by making URL throw
    const req = new Request("http://localhost/api/weather?zip=13501");
    Object.defineProperty(req, 'url', {
      get: () => { throw new Error("Internal failure"); }
    });

    const res = await GET(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal Server Error");
  });
});
