import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/webhooks/documenso/route";
import { NextRequest } from "next/server";
import crypto from "crypto";

vi.mock("@sentry/nextjs", () => ({
  startSpan: vi.fn((_, cb) => cb()),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

describe("Documenso Webhook Receiver", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 500 if WEBHOOK_SECRET is missing", async () => {
    delete process.env.WEBHOOK_SECRET;
    delete process.env.DOCUMENSO_WEBHOOK_SECRET;

    const req = new NextRequest("http://localhost/api/webhooks/documenso", {
      method: "POST",
      body: JSON.stringify({ event: "document.completed" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Webhook configuration error");
  });

  it("returns 401 if signature header is missing", async () => {
    process.env.WEBHOOK_SECRET = "test-secret";

    const req = new NextRequest("http://localhost/api/webhooks/documenso", {
      method: "POST",
      body: JSON.stringify({ event: "document.completed" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Missing signature header");
  });

  it("returns 401 if signature is invalid", async () => {
    process.env.WEBHOOK_SECRET = "test-secret";

    const req = new NextRequest("http://localhost/api/webhooks/documenso", {
      method: "POST",
      headers: {
        "x-documenso-signature": "invalid-signature",
      },
      body: JSON.stringify({ event: "document.completed" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Invalid signature");
  });

  it("returns 200 and processes request if signature is valid", async () => {
    const secret = "test-secret";
    process.env.WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({
      event: "document.completed",
      document: { externalId: "estimate-123" }
    });

    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const req = new NextRequest("http://localhost/api/webhooks/documenso", {
      method: "POST",
      headers: {
        "x-documenso-signature": signature,
      },
      body: payload,
    });

    // Mock successful DB update
    const { createServerClient } = await import("@/lib/supabase/server");
    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    (createServerClient as any).mockReturnValue({
      from: vi.fn().mockReturnValue({ update: mockUpdate }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.received).toBe(true);
  });
});
