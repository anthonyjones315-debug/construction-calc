import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/crm/contacts/route";
import { auth } from "@/lib/auth/config";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

describe("GET /api/crm/contacts security", () => {
  it("returns 401 Unauthorized when session is missing or unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as unknown as Awaited<ReturnType<typeof auth>>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 OK with contact list for authenticated session", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "user@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
  });
});
