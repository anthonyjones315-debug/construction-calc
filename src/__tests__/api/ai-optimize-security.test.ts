import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "../../app/api/ai/optimize/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

// Mock server-only to prevent Vitest import errors
vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

describe("AI Optimize API Security", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-api-key";
  });

  it("should return 401 Unauthorized if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "interior/flooring-waste",
        results: "100 sq ft",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 429 Too Many Requests if rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 15,
    });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "interior/flooring-waste",
        results: "100 sq ft",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("15");

    const body = await res.json();
    expect(body.error).toContain("Too many requests");
  });

  it("should return 400 Bad Request if calculatorId or results are missing (Zod validation)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "", // Empty calculatorId
        results: "",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("should return 400 Bad Request if payload is empty", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: "",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Invalid request body.");
  });
});
