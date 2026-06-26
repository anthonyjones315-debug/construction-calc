import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("Weather API Security Gates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/weather?lat=40&lng=-74");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("proceeds if authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", name: "Test User", email: "test@example.com", image: null },
    });

    const req = new NextRequest("http://localhost/api/weather?lat=invalid&lng=invalid");
    const res = await GET(req);

    expect(res.status).not.toBe(401);
  });
});
