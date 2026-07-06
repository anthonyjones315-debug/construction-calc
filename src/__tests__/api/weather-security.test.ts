import { vi, describe, it, expect } from "vitest";

// Mock server-only before anything else
vi.mock("server-only", () => ({}));

// Mock dependencies that will be added
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

// We'll import the handler. Note: we might need to mock fetch since the handler calls it.
vi.stubGlobal("fetch", vi.fn());

import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

describe("Weather API Security", () => {
  it("returns 401 if unauthenticated", async () => {
    // This test is expected to FAIL until the fix is implemented
    vi.mocked(auth).mockResolvedValue(null);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/weather?lat=45&lng=-75");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limited", async () => {
    // This test is expected to FAIL until the fix is implemented
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/weather?lat=45&lng=-75");
    const res = await GET(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });
});
