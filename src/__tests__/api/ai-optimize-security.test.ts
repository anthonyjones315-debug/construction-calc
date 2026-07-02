import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock server-only before other imports
vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/ai/optimize/route";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

// Mock Sentry to avoid noise
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("AI Optimize Security", () => {
  const mockReq = (body: Record<string, unknown> = { calculatorId: "test", results: "some results" }) => {
    return new NextRequest("https://example.com/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = mockReq();
    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      error: "Too many requests. Please wait a moment before trying again.",
    });
  });

  it("returns 401 when user is not authenticated", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
    vi.mocked(auth).mockResolvedValue(null);

    const req = mockReq();
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("allows the request when authenticated and within rate limits", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123", name: "Test User", email: "test@example.com", image: null } });

    // Mock fetch to avoid real network calls
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ type: "text", text: "Optimized tips" }]
      })
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = mockReq();
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("Optimized tips");

    vi.unstubAllGlobals();
  });
});
