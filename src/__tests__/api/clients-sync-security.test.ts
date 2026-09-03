import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { POST } from "@/app/api/clients/sync/route";

describe("POST /api/clients/sync security tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as unknown as Awaited<ReturnType<typeof auth>>);

    const req = new NextRequest("http://localhost:3000/api/clients/sync", {
      method: "POST",
      body: JSON.stringify({ name: "Jane Contractor" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns generic 500 error and captures Sentry exception on database errors without leaking internal details", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user_123" },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { code: "50000", message: "Sensitive DB credentials or query failure details leaked" },
    });

    vi.mocked(createServerClient).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    } as unknown as ReturnType<typeof createServerClient>);

    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });

    const req = new NextRequest("http://localhost:3000/api/clients/sync", {
      method: "POST",
      body: JSON.stringify({ name: "Jane Contractor" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Internal Server Error" });
    expect(json.error).not.toContain("Sensitive DB credentials");
  });
});
