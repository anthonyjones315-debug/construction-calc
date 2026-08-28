import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

import { GET } from "@/app/api/crm/contacts/route";
import { auth } from "@/lib/auth/config";

describe("/api/crm/contacts GET security", () => {
  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await GET();
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 and contacts list for authenticated user", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_123", email: "user@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as any);

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});
