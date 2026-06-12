import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  startSpan: vi.fn().mockImplementation((_, cb: any) => cb()),
}));

vi.mock("server-only", () => ({}));

describe("Weather API Security Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: "user_123" } } as any);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not Found"),
    });
  });

  it("should return 401 if unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/weather?zip=90210");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should not leak internal error details in 500 response", async () => {
    vi.mocked(auth).mockImplementation(() => {
      throw new Error("Sensitive connection string leaked!");
    });

    const req = new NextRequest("http://localhost/api/weather?zip=90210");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal Server Error");
    expect(data.error).not.toContain("Sensitive");
  });
});
