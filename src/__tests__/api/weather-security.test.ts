import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { getClientIp } from "@/lib/http/client-ip";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    (auth as Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    (auth as Mock).mockResolvedValue({ user: { id: "user_1" } });
    (getClientIp as Mock).mockReturnValue("127.0.0.1");
    (checkMemoryRateLimit as Mock).mockReturnValue({
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

  it("proceeds if authenticated and not rate limited", async () => {
    (auth as Mock).mockResolvedValue({ user: { id: "user_1" } });
    (getClientIp as Mock).mockReturnValue("127.0.0.1");
    (checkMemoryRateLimit as Mock).mockReturnValue({ ok: true });

    // We expect it to continue and probably fail later due to missing environment variables or network in test environment,
    // but it shouldn't be 401 or 429.
    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(429);
  });
});
