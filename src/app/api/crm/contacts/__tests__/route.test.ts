import { describe, it, expect, vi } from "vitest";
import { GET } from "../route";
import { auth } from "@/lib/auth/config";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("server-only", () => ({}));

describe("CRM Contacts API", () => {
  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return demo data if user is authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_123", name: "Test User", email: "test@example.com", image: null },
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
  });
});
