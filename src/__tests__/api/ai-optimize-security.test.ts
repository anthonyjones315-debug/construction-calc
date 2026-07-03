import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ai/optimize/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

// Mock dependencies
vi.mock("server-only", () => ({}));
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
  captureMessage: vi.fn(),
}));

describe("AI Optimize API Security", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 Unauthorized when no session exists", async () => {
    // Mock rate limit to pass
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
    // Mock auth to return no session
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "some results" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 Too Many Requests when rate limited", async () => {
    // Mock rate limit to fail
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "some results" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });
});
