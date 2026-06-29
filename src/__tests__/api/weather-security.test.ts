import { vi, describe, it, expect } from "vitest";

// Mock server-only before any other imports
vi.mock("server-only", () => ({}));

import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

vi.mock("@/lib/auth/config");
vi.mock("@/lib/rate-limit/memory");
vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));
vi.mock("@sentry/nextjs");

describe("Weather API Security", () => {
  it("returns 401 if unauthorized", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    // @ts-ignore - NextRequest vs Request type mismatch in some environments
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 429 if rate limited", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1" } });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });
    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(429);
  });
});
