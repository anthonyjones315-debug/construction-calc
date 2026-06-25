import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { GET } from "@/app/api/weather/route";
import type { AuthSession } from "@/lib/auth/session";

vi.mock("@/lib/auth/config", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit/memory", () => ({ checkMemoryRateLimit: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@/lib/http/client-ip", () => ({ getClientIp: () => "127.0.0.1" }));

describe("Weather API Security", () => {
  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new NextRequest("http://z.com/api/weather?zip=1"));
    expect(res.status).toBe(401);
  });

  it("returns 429 if rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as AuthSession);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });
    const res = await GET(new NextRequest("http://z.com/api/weather?zip=1"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });
});
