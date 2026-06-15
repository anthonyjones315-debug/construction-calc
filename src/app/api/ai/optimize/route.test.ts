import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { auth } from "@/lib/auth/config";
import type { Mock } from "vitest";

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock("@/lib/http/client-ip", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

describe("/api/ai/optimize", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
    (checkMemoryRateLimit as Mock).mockReturnValue({ ok: true });
  });

  it("returns 401 if unauthorized", async () => {
    (auth as Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "some results" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 200 if authorized", async () => {
    (auth as Mock).mockResolvedValue({ user: { id: "user_123" } });

    const req = new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST",
      body: JSON.stringify({ calculatorId: "test", results: "some results" }),
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ type: "text", text: "tips" }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("tips");
  });
});
