/**
 * @vitest-environment node
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/feedback/route";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

const mockSend = vi.fn();
vi.mock("resend", () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe("POST /api/feedback Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_mock_12345";
  });

  it("returns generic error message on email provider failure without leaking raw error details", async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: {
        message: "Domain not verified: owner@proconstructioncalc.com is not allowed. Check DNS settings at https://resend.com/domains",
      },
    });

    const req = new NextRequest("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "203.0.113.42",
      },
      body: JSON.stringify({
        email: "user@example.com",
        message: "Great app!",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);

    const body = await res.json();
    expect(body).toEqual({
      error: "Failed to send feedback. Please try again later.",
    });
    expect(JSON.stringify(body)).not.toContain("Domain not verified");
    expect(JSON.stringify(body)).not.toContain("https://resend.com/domains");
  });
});
