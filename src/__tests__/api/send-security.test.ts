import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockCaptureException = vi.fn();
const mockCaptureMessage = vi.fn();
const mockAuth = vi.fn();
const mockCreateServerClient = vi.fn();
const mockCheckMemoryRateLimit = vi.fn();
const mockSend = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => mockCreateServerClient(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn().mockResolvedValue({ role: "owner" }),
  getTenantScopeColumn: vi.fn().mockReturnValue("owner_id"),
  getTenantScopeId: vi.fn().mockReturnValue("user-1"),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: (...args: unknown[]) => mockCheckMemoryRateLimit(...args),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: mockSend,
    };
  },
}));

import { POST } from "@/app/api/send/route";

describe("/api/send Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";

    mockAuth.mockResolvedValue({
      user: { id: "user-1", email: "user@example.com" },
      expires: "2099-01-01",
    });

    mockCheckMemoryRateLimit.mockReturnValue({ ok: true });

    mockCreateServerClient.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    });
  });

  it("returns 502 with generic error message when Resend fails, withholding raw error details", async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: "Internal server error on resend API. Key sk_123 invalid domain" },
    });

    const request = new NextRequest("http://localhost/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "client@example.com",
        subject: "Test Subject",
        html: "<p>Hello</p>",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(502);

    const json = await response.json();
    expect(json).toEqual({ error: "Failed to send email. Please try again later." });
    expect(json.error).not.toContain("sk_123");
    expect(json.error).not.toContain("Resend");
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Resend API error: Internal server error on resend API. Key sk_123 invalid domain",
      "warning",
    );
  });
});
