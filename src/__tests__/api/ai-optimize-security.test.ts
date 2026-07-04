import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ai/optimize/route";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { auth } from "@/lib/auth/config";

// Mock server-only to avoid Vitest errors
vi.mock("server-only", () => ({}));

// Mock authentication
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

// Mock rate limiting
vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

describe("AI Optimize API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 when rate limit exceeded", async () => {
    // Rate limit check happens before auth
    (checkMemoryRateLimit as any).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });

  it("returns 401 when unauthorized", async () => {
    (checkMemoryRateLimit as any).mockReturnValue({ ok: true });
    (auth as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });
});
