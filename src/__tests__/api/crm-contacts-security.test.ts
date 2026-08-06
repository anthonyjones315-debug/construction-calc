import { vi, describe, it, expect } from "vitest";
import { GET } from "@/app/api/crm/contacts/route";
import { auth } from "@/lib/auth/config";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

describe("CRM contacts API security", () => {
  it("returns 401 Unauthorized if there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 OK if the user is authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_test", name: "Test User", email: "test@example.com", image: null },
    });
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].name).toBe("John Doe");
  });
});
