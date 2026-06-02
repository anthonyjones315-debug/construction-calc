import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

vi.mock("@/lib/auth/config", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit/memory", () => ({ checkMemoryRateLimit: vi.fn() }));
vi.mock("@/lib/http/client-ip", () => ({ getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn(), captureMessage: vi.fn() }));

describe("Weather API Security", () => {
  it("blocks unauthenticated and limits rate", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const res401 = await GET(new Request("http://l/api/weather"));
    expect(res401.status).toBe(401);

    vi.mocked(auth).mockResolvedValue({ user: { id: "u1", name: null, email: null, image: null } });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 1 });
    const res429 = await GET(new Request("http://l/api/weather"));
    expect(res429.status).toBe(429);

    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
    const reqErr = new Request("http://l/api/weather");
    Object.defineProperty(reqErr, 'url', { get: () => { throw new Error(); } });
    const res500 = await GET(reqErr);
    expect(res500.status).toBe(500);
    expect(await res500.json()).toEqual({ error: "Internal Server Error" });
  });
});
