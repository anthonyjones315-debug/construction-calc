import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/weather/route";
import { auth } from "@/lib/auth/config";
import * as Sentry from "@sentry/nextjs";
import type { Mock } from "vitest";

vi.mock("@/lib/auth/config", () => ({ auth: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

describe("Weather API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_MAPS_API_KEY = "mock-key";
  });

  it("should return 401 if unauthorized", async () => {
    (auth as Mock).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/weather?lat=40&lng=-74"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("should return 500 with generic message on internal error", async () => {
    (auth as Mock).mockResolvedValue({ user: { id: "user_1" } });
    const req = { url: "invalid-url", headers: new Headers() } as unknown as Request;
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal Server Error" });
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it("should return 200 if authorized", async () => {
    (auth as Mock).mockResolvedValue({ user: { id: "user_1" } });
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        current_weather: { temperature: 72, windspeed: 5, weathercode: 0, is_day: 1 },
        daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], weathercode: [] }
      })
    });
    const res = await GET(new Request("http://localhost/api/weather?lat=40&lng=-74"));
    expect(res.status).toBe(200);
    expect((await res.json()).temperature).toBe(72);
  });
});
