import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/crm/contacts/route";
import { auth } from "@/lib/auth/config";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

describe("CRM contacts security", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 Unauthorized when there is no authenticated session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 OK and demo data when session is authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        image: null,
      },
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].name).toBe("John Doe");
  });
});
