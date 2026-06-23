import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/config", () => ({ auth: vi.fn() }));
vi.mock("@/lib/http/client-ip", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/rate-limit/memory", () => ({ checkMemoryRateLimit: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

describe("Weather API Security", () => {
  it("enforces auth and rate limiting", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    expect((await GET(new NextRequest("http://l"))).status).toBe(401);

    vi.mocked(auth).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 1 });
    expect((await GET(new NextRequest("http://l"))).status).toBe(429);
  });
});
