import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/command-center/join/route";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  }),
}));

describe("/api/command-center/join rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rate limits requests exceeding 5 attempts per 10 minutes", async () => {
    const makeRequest = () =>
      new NextRequest("http://localhost:3000/api/command-center/join", {
        method: "POST",
        headers: {
          "x-forwarded-for": "203.0.113.195",
          "content-type": "application/json",
        },
        body: JSON.stringify({ joinCode: "ABCD2345" }),
      });

    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest());
      expect(res.status).not.toBe(429);
    }

    const blockedRes = await POST(makeRequest());
    expect(blockedRes.status).toBe(429);
    const body = await blockedRes.json();
    expect(body.error).toMatch(/too many join attempts/i);
    expect(blockedRes.headers.get("Retry-After")).toBeDefined();
  });
});
