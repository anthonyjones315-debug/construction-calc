import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";
import { GET } from "@/app/api/estimates/signed-since/route";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeColumn: vi.fn(() => "user_id"),
  getTenantScopeId: vi.fn(() => "user-123"),
}));

describe("GET /api/estimates/signed-since security and behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when session is missing", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost/api/estimates/signed-since");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 Unauthorized when session user ID is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: {} } as any);

    const request = new NextRequest("http://localhost/api/estimates/signed-since");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns generic 500 without leaking database error message when query fails", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "contractor@example.com" },
    } as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValue({} as any);

    const mockLimit = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: "pg_catalog.saved_estimates relation does not exist at postgres://secret-db:5432/main",
      },
    });
    const mockOrder = vi.fn(() => ({ limit: mockLimit }));
    const mockGte = vi.fn(() => ({ order: mockOrder }));
    const mockIn = vi.fn(() => ({ gte: mockGte }));
    const mockEq = vi.fn(() => ({ in: mockIn }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    vi.mocked(createServerClient).mockReturnValue({
      from: mockFrom,
    } as any);

    const request = new NextRequest(
      "http://localhost/api/estimates/signed-since?since=2026-01-01T00:00:00.000Z",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(body.error).not.toContain("postgres");
    expect(body.error).not.toContain("relation does not exist");
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("relation does not exist"),
      }),
    );
  });

  it("returns estimates and count when query succeeds", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "contractor@example.com" },
    } as any);
    vi.mocked(getBusinessContextForSession).mockResolvedValue({} as any);

    const mockEstimates = [
      {
        id: "est-1",
        name: "Deck Project",
        client_name: "John Doe",
        updated_at: "2026-03-15T12:00:00.000Z",
      },
    ];

    const mockLimit = vi.fn().mockResolvedValue({
      data: mockEstimates,
      error: null,
    });
    const mockOrder = vi.fn(() => ({ limit: mockLimit }));
    const mockGte = vi.fn(() => ({ order: mockOrder }));
    const mockIn = vi.fn(() => ({ gte: mockGte }));
    const mockEq = vi.fn(() => ({ in: mockIn }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    vi.mocked(createServerClient).mockReturnValue({
      from: mockFrom,
    } as any);

    const request = new NextRequest("http://localhost/api/estimates/signed-since");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      count: 1,
      estimates: mockEstimates,
    });
  });

  it("returns generic 500 when unexpected exception occurs", async () => {
    vi.mocked(auth).mockRejectedValue(new Error("Unexpected crash"));

    const request = new NextRequest("http://localhost/api/estimates/signed-since");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
