import { vi, describe, it, expect } from "vitest";
import { GET } from "@/app/api/crm/contacts/route";

// Mock server-only to prevent environment errors
vi.mock("server-only", () => ({}));

// Create a mock auth function
const mockAuth = vi.fn();
vi.mock("@/lib/auth/config", () => ({
  auth: () => mockAuth(),
}));

describe("CRM Contacts API Security", () => {
  it("should return 401 Unauthorized when there is no active session", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await GET();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 401 Unauthorized when the session lacks a user ID", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: undefined } });

    const response = await GET();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 200 and CRM contacts when a valid session is present", async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: "user_123",
        name: "Test User",
        email: "test@example.com",
      },
    });

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
    expect(data[0]).toHaveProperty("email");
  });
});
