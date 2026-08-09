import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/optimize/route";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockCheckMemoryRateLimit = vi.fn();

vi.mock("@/lib/auth/config", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: (
    storeName: string,
    key: string,
    limit: number,
    windowMs: number
  ): { ok: true } | { ok: false; retryAfterSeconds: number } =>
    mockCheckMemoryRateLimit(storeName, key, limit, windowMs),
}));

// Mock Sentry to avoid overhead/unneeded logs
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  startSpan: (options: Record<string, unknown>, callback: () => unknown) => callback(),
}));

describe("AI Optimize API Security and Validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.ANTHROPIC_API_KEY = "test_key";
  });

  it("returns 401 Unauthorized when there is no active session", async () => {
    mockAuth.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "some results" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json() as { error: string };
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 429 Too Many Requests when rate limit is exceeded", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockCheckMemoryRateLimit.mockReturnValue({ ok: false, retryAfterSeconds: 30 });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "some results" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    const json = await res.json() as { error: string };
    expect(json.error).toContain("Too many requests");
  });

  it("returns 400 Bad Request when parameters are missing or invalid (Zod validation)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockCheckMemoryRateLimit.mockReturnValue({ ok: true });

    // Missing results
    const req1 = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test" }),
    });

    const res1 = await POST(req1);
    expect(res1.status).toBe(400);
    const json1 = await res1.json() as { error: string };
    expect(json1.error.toLowerCase()).toMatch(/undefined|required/);

    // Empty calculatorId
    const req2 = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "", results: "some results" }),
    });

    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
    const json2 = await res2.json() as { error: string };
    expect(json2.error.toLowerCase()).toContain("required");
  });

  it("returns 503 Service Unavailable when ANTHROPIC_API_KEY is not configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockCheckMemoryRateLimit.mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "some results" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const json = await res.json() as { error: string };
    expect(json.error).toContain("not configured");
  });

  it("successfully passes validation and returns AI tips", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockCheckMemoryRateLimit.mockReturnValue({ ok: true });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "1. Optimize. 2. Save." }],
      }),
    });
    global.fetch = fetchMock;

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "interior/flooring-waste",
        results: "145 sq ft",
        context: "Low budget",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json() as { content: string };
    expect(json.content).toBe("1. Optimize. 2. Save.");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
