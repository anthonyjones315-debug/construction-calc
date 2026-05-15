import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { getClientIp } from "@/lib/http/client-ip";
import { NextRequest } from "next/server";

// Mock server-only by defining it as an empty module if needed,
// or just mock the things that import it.
vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config");
vi.mock("@/lib/rate-limit/memory");
vi.mock("@/lib/http/client-ip");
vi.mock("@sentry/nextjs");

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(getClientIp).mockReturnValue("1.2.3.4");
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const res = await GET(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toMatch(/too many requests/i);
  });

  it("allows the request if authenticated and under rate limit", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(getClientIp).mockReturnValue("1.2.3.4");
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Mock fetch to prevent actual calls and return a minimal response
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ current_weather: { temperature: 70, weathercode: 0 } })
      })
    );

    const req = new NextRequest("http://localhost/api/weather?lat=40&lng=-74");
    const res = await GET(req);

    expect(res.status).toBe(200);
  });
});
