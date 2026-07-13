import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

// Mock dependencies
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
}));

// Mock server-only to prevent import errors in vitest
vi.mock("server-only", () => ({}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const response = await GET(req);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 30,
    });

    const req = new NextRequest("http://localhost/api/weather?zip=12345");
    const response = await GET(req);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    const data = await response.json();
    expect(data.error).toContain("Too many requests");
  });

  it("proceeds if authenticated and within rate limits", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Mock fetch to prevent actual API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "OK", results: [{ geometry: { location: { lat: 0, lng: 0 } }, formatted_address: "Test" }] }),
    });

    // We expect it to try to fetch or return 400 because of missing search params in this case if we didn't provide enough
    const req = new NextRequest("http://localhost/api/weather?zip=12345");

    // We don't necessarily need it to succeed fully (which would require mocking more things),
    // but just checking it passed the security gates.
    await GET(req);

    expect(auth).toHaveBeenCalled();
    expect(checkMemoryRateLimit).toHaveBeenCalledWith("weather-api", "127.0.0.1", 15, 60000);
  });
});
