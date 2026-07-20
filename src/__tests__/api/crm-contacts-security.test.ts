import { vi, describe, it, expect } from "vitest";
import { GET } from "@/app/api/crm/contacts/route";
import { auth } from "@/lib/auth/config";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("server-only", () => ({}));

describe("CRM Contacts API Route Security", () => {
  it("returns 401 Unauthorized when no session is present", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 Unauthorized when session user ID is missing", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {} as { id: string; name?: string; email?: string; image?: string },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const response = await GET();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 OK and contact data when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        image: "test-image",
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
    expect(data[0]).toHaveProperty("email");
  });
});
