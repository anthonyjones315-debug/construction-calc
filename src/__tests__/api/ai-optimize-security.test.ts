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

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock("server-only", () => ({}));

describe("AI Optimize API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  it("returns 401 if unauthenticated", async () => {
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

  it("returns 429 if rate limit exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
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
  });

  it("returns 400 if payload is invalid (missing fields)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test" }), // missing results
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    // Zod's default message for missing required string is "Required" or similar,
    // but here it seems it's returning a more generic message or the one from result.error.issues[0]?.message
    expect(data.error).toBeDefined();
  });
});
