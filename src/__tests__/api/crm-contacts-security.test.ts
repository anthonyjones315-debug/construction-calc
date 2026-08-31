import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth/config";
import { GET } from "@/app/api/crm/contacts/route";

describe("GET /api/crm/contacts - Security", () => {
  it("returns 401 Unauthorized when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("returns CRM contacts list when authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user_123", email: "user@example.com" },
      expires: "2099-01-01",
    } as any);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
