import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/optimize/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { NextRequest } from "next/server";

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
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 429 if rate limited", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });
});
