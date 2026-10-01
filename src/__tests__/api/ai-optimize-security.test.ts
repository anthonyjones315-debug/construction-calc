import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

import { POST } from "@/app/api/ai/optimize/route";
import { auth } from "@/lib/auth/config";

describe("/api/ai/optimize security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as ReturnType<typeof auth>);

    const req = new NextRequest("http://localhost:3000/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "concrete/slab",
        results: "Volume: 5 cu yd",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("proceeds past auth check when user is authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
      expires: "2030-01-01T00:00:00.000Z",
    } as unknown as ReturnType<typeof auth>);

    const req = new NextRequest("http://localhost:3000/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({
        calculatorId: "concrete/slab",
        results: "Volume: 5 cu yd",
      }),
    });

    const res = await POST(req);
    // Unconfigured ANTHROPIC_API_KEY in test environment yields 503 Service Unavailable,
    // confirming auth passed successfully before reaching service config check.
    expect(res.status).toBe(503);

    const data = await res.json();
    expect(data).toEqual({ error: "AI service not configured." });
  });
});
