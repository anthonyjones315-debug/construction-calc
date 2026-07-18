/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/send/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

// Mock server-only to prevent import errors in non-server environments
vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/business", () => ({
  getBusinessContextForSession: vi.fn(),
  getTenantScopeColumn: vi.fn(() => "business_id"),
  getTenantScopeId: vi.fn(() => "biz-123"),
}));

vi.mock("@/lib/rate-limit/memory", () => ({
  checkMemoryRateLimit: vi.fn(),
}));

// Mock Resend using a standard class to avoid Vitest vi.fn class warning
const mockSend = vi.fn();
vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe("Email API Security (/api/send)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_123456789";
  });

  const validEstimatePayload = {
    to: "client@example.com",
    subject: "Your construction estimate",
    estimate: {
      title: "Deck Construction",
      calculatorLabel: "Deck Estimator",
      results: [
        { label: "Total Area", value: 150, unit: "sq ft" },
      ],
    },
  };

  it("returns 401 when the user session is unauthorized", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/send", {
      method: "POST",
      body: JSON.stringify(validEstimatePayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("rejects invalid request body with 400", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "user@example.com" },
    } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    const req = new NextRequest("http://localhost/api/send", {
      method: "POST",
      body: JSON.stringify({ to: "invalid-email", subject: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("completely ignores client-provided 'html' to prevent HTML injection/spam template bypass", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", email: "user@example.com" },
    } as any);
    vi.mocked(checkMemoryRateLimit).mockReturnValue({ ok: true });

    // Mock Supabase
    const mockSingle = vi.fn().mockResolvedValue({
      data: { business_email: "biz@example.com" },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    vi.mocked(createServerClient).mockReturnValue({
      from: mockFrom,
    } as any);

    vi.mocked(getBusinessContextForSession).mockResolvedValue({
      userId: "user-123",
      businessId: "biz-123",
      role: "owner",
    } as any);

    mockSend.mockResolvedValue({ data: { id: "msg_123" }, error: null });

    const maliciousPayload = {
      ...validEstimatePayload,
      html: "<h1>Phishing / Spam content!</h1><a href='http://malicious.com'>Click here</a>",
    };

    const req = new NextRequest("http://localhost/api/send", {
      method: "POST",
      body: JSON.stringify(maliciousPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify that emails.send was called, but the HTML body is built strictly from the estimate,
    // completely discarding the injected 'html' parameter.
    expect(mockSend).toHaveBeenCalled();
    const sendArgs = mockSend.mock.calls[0][0];
    expect(sendArgs.html).not.toContain("Phishing / Spam content!");
    expect(sendArgs.html).not.toContain("http://malicious.com");
    expect(sendArgs.html).toContain("Deck Construction");
    expect(sendArgs.html).toContain("Deck Estimator");
  });
});
