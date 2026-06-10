import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  startSpan: vi.fn().mockImplementation((_, cb) => cb()),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new Request("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limited", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new Request("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("returns 500 with generic message on internal error", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Trigger error by mocking URL to throw or similar,
    // but easiest is to mock a used function to throw.
    // We can mock URL to throw when accessed if we want to be fancy as per memory.
    const req = new Request("http://localhost/api/weather?zip=12345");

    // Force error in the try block
    vi.spyOn(global, "URL").mockImplementationOnce(function () {
      throw new Error("Simulated failure");
    } as any);

    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");
  });
});
