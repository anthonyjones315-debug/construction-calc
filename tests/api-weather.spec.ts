import { describe, it, expect, vi, beforeEach } from "vitest";
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new Request("http://localhost/api/weather?zip=78701");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 429 if rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", name: "Test User", email: "test@example.com", image: null },
    });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new Request("http://localhost/api/weather?zip=78701");
    const res = await GET(req);

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe("Too many requests");
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("should return 500 with generic message on unexpected error", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", name: "Test User", email: "test@example.com", image: null },
    });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Cause an error by making accessing req.url throw
    const req = {
      get url() {
        throw new Error("Unexpected failure");
      },
    } as unknown as Request;

    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Weather error");
  });
});
