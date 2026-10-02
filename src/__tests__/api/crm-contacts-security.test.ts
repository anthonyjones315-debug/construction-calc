import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/crm/contacts/route";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

describe("/api/crm/contacts security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 OK with contact data when authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "user@example.com" },
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("name");
  });

  it("captures unexpected errors with Sentry and returns generic 500", async () => {
    vi.mocked(auth).mockRejectedValueOnce(new Error("Database connection lost"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
