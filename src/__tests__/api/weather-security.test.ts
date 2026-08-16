import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Security & Error Handling", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns 500 with generic 'Internal Server Error' when an unexpected internal error occurs", async () => {
    const sensitiveErrorMessage = "Database connection string postgresql://user:secret@db.internal:5432/app failed";

    global.fetch = vi.fn().mockRejectedValue(new Error(sensitiveErrorMessage));

    const request = new NextRequest("http://localhost:3000/api/weather?lat=40.7128&lng=-74.0060");
    const response = await GET(request);

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(body)).not.toContain(sensitiveErrorMessage);
    expect(JSON.stringify(body)).not.toContain("secret");
  });
});
