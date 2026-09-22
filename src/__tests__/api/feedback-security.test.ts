import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/feedback/route";
import * as Sentry from "@sentry/nextjs";

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

vi.mock("@sentry/nextjs", () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}));

describe("Feedback API Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
  });

  it("returns generic error message on Resend API failure without leaking provider error details", async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: "Domain owner@proconstructioncalc.com is not verified on Resend account" },
    });

    const req = new NextRequest("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        email: "user@example.com",
        message: "Great application!",
        subject: "General Inquiry",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Failed to send feedback. Please try again later." });
    expect(body.error).not.toContain("Resend");
    expect(body.error).not.toContain("verified domain");
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.stringContaining("Resend feedback API error: Domain owner@proconstructioncalc.com is not verified"),
      "warning"
    );
  });
});
