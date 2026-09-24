import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/crm/contacts/route";
import { auth } from "@/lib/auth/config";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("CRM Contacts API Route Security", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 Unauthorized when no session is present", async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as Awaited<ReturnType<typeof auth>>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 Unauthorized when session user ID is missing", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {},
      expires: "2099-01-01",
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 OK with contacts when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "user@example.com" },
      expires: "2099-01-01",
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
  });

  it("returns generic 500 Internal Server Error when auth throws unexpectedly", async () => {
    vi.mocked(auth).mockRejectedValue(new Error("Database connection error details"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(data)).not.toContain("Database connection error details");
  });
});
