import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/optimize/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

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

describe("AI Optimize Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  it("should return 429 if rate limited", async () => {
    (checkMemoryRateLimit as any).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });

  it("should return 401 if unauthenticated", async () => {
    (checkMemoryRateLimit as any).mockReturnValue({ ok: true });
    (auth as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if validation fails (missing fields)", async () => {
    (checkMemoryRateLimit as any).mockReturnValue({ ok: true });
    (auth as any).mockResolvedValue({ user: { id: "user-123" } });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test" }), // Missing results
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("should return 400 if validation fails (results too long)", async () => {
    (checkMemoryRateLimit as any).mockReturnValue({ ok: true });
    (auth as any).mockResolvedValue({ user: { id: "user-123" } });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "test",
        results: "a".repeat(20001)
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
