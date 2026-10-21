import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/weather/route";
import * as Sentry from "@sentry/nextjs";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Weather API Security", () => {
  it("hides error details and returns generic 500 when an unexpected error occurs", async () => {
    // Pass invalid URL/request that triggers an error inside the try block
    const req = new Request("http://localhost/api/weather?lat=invalid_lat&lng=invalid_lng");

    // Override URL.prototype.searchParams or force throw via mock if needed
    // or pass latParam/lngParam that causes parseFloat to fail geocoding / processing
    // Let's pass a request with lat & lng that causes fetch to fail or throws inURL constructor
    const badReq = {
      get url() {
        throw new Error("Sensitive DB/Network Error with internal_key=secret_123");
      },
    } as unknown as Request;

    const res = await GET(badReq);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(body.error).not.toContain("Sensitive DB/Network Error");
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
