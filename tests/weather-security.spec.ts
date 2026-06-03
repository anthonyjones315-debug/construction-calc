import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { getClientIp } from "@/lib/http/client-ip";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getClientIp as any).mockReturnValue("127.0.0.1");
    (checkMemoryRateLimit as any).mockReturnValue({ ok: true });
  });

  it("returns 401 if user is not authenticated", async () => {
    (auth as any).mockResolvedValue(null);

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    (checkMemoryRateLimit as any).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toBe("Too many requests");
  });

  it("returns generic 500 error if an internal error occurs", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user_123" } });

    // Trigger an error by passing a request that will fail later in the try block
    // but before that, let's mock URL to throw or something similar if possible,
    // or just rely on the fact that any throw in the try block should be caught.

    // Actually, let's mock URL constructor or searchParams access if we really want to force it,
    // but simpler is to mock auth to throw (though we want to test the catch block of the whole GET)

    (auth as any).mockRejectedValue(new Error("Database down"));

    const req = new Request("http://localhost/api/weather?zip=13502");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal Server Error");
  });
});
