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
  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user_123", name: null, email: null, image: null },
    });
    vi.mocked(checkMemoryRateLimit).mockReturnValueOnce({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toMatch(/too many requests/i);
  });

  it("returns 500 with generic message on internal error", async () => {
    vi.mocked(auth).mockRejectedValueOnce(new Error("Database failure"));

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal Server Error");
  });

  it("handles Next.js prerender errors as 401", async () => {
    const prerenderError = new Error("Dynamic server usage: headers() usage during prerendering");
    (prerenderError as unknown as { digest: string }).digest = "HANGING_PROMISE_REJECTION";
    vi.mocked(auth).mockRejectedValueOnce(prerenderError);

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });
});
