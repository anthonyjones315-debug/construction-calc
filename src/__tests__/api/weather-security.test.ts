import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns generic 'Internal Server Error' when fetch fails without exposing raw details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Database secret or connection string exposed!"))
    );

    const req = new Request("http://localhost:3000/api/weather?lat=43.1&lng=-75.2");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(body)).not.toContain("Database secret");
  });
});
