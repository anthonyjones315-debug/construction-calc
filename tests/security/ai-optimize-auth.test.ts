import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock server-only before any other imports
vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/ai/optimize/route";
import { auth } from "@/lib/auth/config";

// Mock auth
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

// Mock rate limit
vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(() => ({ ok: true })),
}));

describe("AI Optimize API Auth Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (auth as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "test",
        results: "test",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should allow request if user is authenticated", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user_123" } });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "test",
        results: "test",
      }),
    });

    const res = await POST(req);
    // Should proceed past auth. It might return 503 if API key is missing,
    // but not 401.
    expect(res.status).not.toBe(401);
  });
});
