import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/config", () => ({ auth: vi.fn(() => ({ user: { id: "u1" } })) }));
vi.mock("@/lib/supabase/server", () => ({ createServerClient: vi.fn(() => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) }) })) }));
vi.mock("@/lib/supabase/business", () => ({ getBusinessContextForSession: vi.fn(() => Promise.resolve({})), getTenantScopeColumn: () => "business_id", getTenantScopeId: () => "b1" }));
vi.mock("@/lib/rate-limit/memory", () => ({ checkMemoryRateLimit: () => ({ ok: true }) }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn(), captureException: vi.fn() }));

const mockSend = vi.fn();
vi.mock("resend", () => ({ Resend: class { emails = { send: mockSend }; } }));

import { POST as sendPOST } from "@/app/api/send/route";
import { POST as feedbackPOST } from "@/app/api/feedback/route";

describe("Email API Security Tests", () => {
  it("send and feedback routes return generic 502 errors without leaking Resend error messages", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const sensitiveErrorMsg = "Domain unverified_domain.com is not verified. API Key secret_key_abc";
    mockSend.mockResolvedValue({ error: { message: sensitiveErrorMsg } });

    const sendReq = new NextRequest("http://localhost/api/send", {
      method: "POST",
      body: JSON.stringify({ to: "c@example.com", subject: "S", html: "<p>H</p>" }),
    });
    const sendRes = await sendPOST(sendReq);
    expect(sendRes.status).toBe(502);
    const sendJson = await sendRes.json();
    expect(sendJson.error).not.toContain(sensitiveErrorMsg);

    const fbReq = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({ email: "u@example.com", message: "M" }),
    });
    const fbRes = await feedbackPOST(fbReq);
    expect(fbRes.status).toBe(502);
    const fbJson = await fbRes.json();
    expect(fbJson.error).not.toContain(sensitiveErrorMsg);
  });
});
