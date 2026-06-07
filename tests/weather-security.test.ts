import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

vi.mock("@/lib/auth/config", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit/memory", () => ({ checkMemoryRateLimit: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn(), startSpan: vi.fn((_, cb) => cb()) }));

describe("Weather API Security", () => {
  it("verifies security: 401 unauth, 429 rate limited, 500 generic error", async () => {
    const req = new Request("http://l/api/weather");
    vi.mocked(auth).mockResolvedValueOnce(null).mockResolvedValueOnce({ user: { id: "u1" } } as any).mockImplementationOnce(() => { throw new Error(); });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 1 } as any);

    const r1 = await GET(req);
    expect(r1.status).toBe(401);

    const r2 = await GET(req);
    expect(r2.status).toBe(429);

    const r3 = await GET(req);
    expect(r3.status).toBe(500);
    expect(await r3.json()).toEqual({ error: "Internal Server Error" });
  });
});
