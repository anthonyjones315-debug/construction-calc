import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { POST } from "@/app/api/send/route";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn().mockResolvedValue({
    userId: "user-123",
    businessId: "biz-123",
    usesLegacyUserScope: false,
  }),
  getTenantScopeColumn: vi.fn().mockImplementation(() => "business_id"),
  getTenantScopeId: vi.fn().mockImplementation(() => "biz-123"),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn().mockReturnValue({ ok: true }),
}));

vi.mock("resend", () => {
  function MockResend() {
    return {
      emails: {
        send: async () => ({
          data: null,
          error: { message: "Internal Resend Domain Verification Failure: domain_not_found_1234" },
        }),
      },
    };
  }
  return { Resend: MockResend };
});

describe("POST /api/send security error handling", () => {
  it("sanitizes raw Resend error messages and captures details in Sentry", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_123456789");
    vi.mocked(auth).mockImplementation(async () => ({
      user: { id: "user-123", email: "contractor@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as any));

    vi.mocked(createServerClient).mockImplementation(() => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { business_email: "biz@example.com" },
            }),
          }),
        }),
      }),
    } as any));

    const req = new NextRequest("http://localhost/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "client@example.com",
        subject: "Your Estimate",
        html: "<p>Estimate details</p>",
      }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({
      error: "Failed to send email. Please try again later.",
    });

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "Resend API error: Internal Resend Domain Verification Failure: domain_not_found_1234",
      "warning",
    );
  });
});
