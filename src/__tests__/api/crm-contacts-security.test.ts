import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/crm/contacts/route";
import { auth } from "@/lib/auth/config";
import * as Sentry from "@sentry/nextjs";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("CRM Contacts API Security (/api/crm/contacts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const res = await GET();
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 with CRM contacts for authenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_123", email: "contractor@example.com" },
    } as never);

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty("name");
  });

  it("captures unexpected errors with Sentry and returns generic 500 error", async () => {
    vi.mocked(auth).mockRejectedValue(new Error("Unexpected Auth Failure"));

    const res = await GET();
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
