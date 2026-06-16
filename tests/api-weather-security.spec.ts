import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import type { Session } from "@/lib/auth/session";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn(), startSpan: vi.fn((_, cb) => cb()) }));
vi.mock("@/lib/auth/config", () => ({ auth: vi.fn() }));

describe("Weather API Security", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("GOOGLE_MAPS_API_KEY", "mock-key"); });

  it("returns 401 Unauthorized when no session is present", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/weather"));
    expect(res.status).toBe(401);
  });

  it("allows access when authentication is present", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as unknown as Session);
    const res = await GET(new Request("http://localhost/api/weather"));
    expect(res.status).not.toBe(401);
  });

  it("returns a generic error message in catch block", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as unknown as Session);
    const req = { get url() { throw new Error("Sensitive"); } } as unknown as Request;
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});
