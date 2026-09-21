import { describe, expect, it, vi } from "vitest";
import { GET as weatherGET } from "@/app/api/weather/route";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("Weather API Security Hardening", () => {
  it("returns generic 500 error message and suppresses raw error details when fetch throws", async () => {
    // Mock fetch to throw a network or internal error with sensitive error message
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error("PGRST301: internal connection pool exhausted or connection string secret leaked"));

    try {
      const req = new Request("http://localhost/api/weather?lat=43.1&lng=-75.2");
      const res = await weatherGET(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json).toEqual({ error: "Failed to fetch weather data." });
      expect(json.error).not.toContain("PGRST301");
      expect(json.error).not.toContain("connection string secret");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
