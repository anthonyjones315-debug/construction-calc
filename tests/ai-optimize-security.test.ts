import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("/api/ai/optimize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limited", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({
      ok: false,
      retryAfterSeconds: 60,
    });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    const body = await res.json();
    expect(body.error).toMatch(/too many requests/i);
  });
});
