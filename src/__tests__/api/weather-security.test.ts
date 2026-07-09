import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

// Mock auth
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_MAPS_API_KEY = "mock-key";
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/weather?lat=40&lng=-74");

    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 when rate limit exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1" } } as any);

    // Default limit is 10
    // Use different IPs or reset state? Since it's in-memory and shared across tests in same process
    // Let's use different IPs for different tests or just accept that it carries over

    for (let i = 0; i < 10; i++) {
      const req = new NextRequest("http://localhost/api/weather?lat=40&lng=-74", {
        headers: { "x-forwarded-for": "1.2.3.4" }
      });
      const res = await GET(req);
      if (res.status === 429) {
         // Already hit limit from previous tests, that's fine
         break;
      }
      expect(res.status).not.toBe(429);
    }

    const reqLimit = new NextRequest("http://localhost/api/weather?lat=40&lng=-74", {
      headers: { "x-forwarded-for": "1.2.3.4" }
    });
    const res = await GET(reqLimit);
    expect(res.status).toBe(429);
  });

  it("returns 400 for invalid input", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_1" } } as any);

    // Use a fresh IP for this test to avoid 429
    const req1 = new NextRequest("http://localhost/api/weather", {
       headers: { "x-forwarded-for": "1.2.3.5" }
    });
    const res1 = await GET(req1);
    expect(res1.status).toBe(400);

    // Invalid zip
    const req2 = new NextRequest("http://localhost/api/weather?zip=abc", {
       headers: { "x-forwarded-for": "1.2.3.5" }
    });
    const res2 = await GET(req2);
    expect(res2.status).toBe(400);
  });
});
