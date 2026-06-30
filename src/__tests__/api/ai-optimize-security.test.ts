import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/optimize/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/config", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit/memory", () => ({ checkMemoryRateLimit: vi.fn() }));
vi.mock("@/lib/http/client-ip", () => ({ getClientIp: vi.fn(() => "127.0.0.1") }));

describe("AI Optimize Security", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });
    vi.mocked(auth).mockResolvedValue(null);

    const res = await POST(new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST", body: JSON.stringify({ calculatorId: "test", results: "test" }),
    }));
    expect(res.status).toBe(401);
  });

  it("returns 429 if rate limit is exceeded", async () => {
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: false, retryAfterSeconds: 60 });

    const res = await POST(new NextRequest("http://localhost/api/ai/optimize", {
      method: "POST", body: JSON.stringify({ calculatorId: "test", results: "test" }),
    }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });
});
