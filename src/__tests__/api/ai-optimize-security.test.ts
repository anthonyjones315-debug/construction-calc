import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/ai/optimize/route";
import { NextRequest } from "next/server";

// Mock the auth module since it uses server-only
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

// Mock rate limit
vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(() => ({ ok: true })),
}));

import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

// Set required environment variables for tests
process.env.ANTHROPIC_API_KEY = "test-key";

describe("AI Optimize API Security", () => {
  it("should return 401 if user is unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "test-calc",
        results: "some results",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 429 if rate limited", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "test-calc",
        results: "some results",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("should return 400 for invalid input", async () => {
    // Authenticated but invalid input
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "user_123",
        name: "Test User",
        email: "test@example.com",
        image: null,
      },
    });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "", // Empty ID
        results: "some results",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid request data");
  });
});
