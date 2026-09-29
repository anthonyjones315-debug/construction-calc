import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/generate-pdf/route";

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
  getTenantScopeColumn: vi.fn().mockReturnValue("business_id"),
  getTenantScopeId: vi.fn().mockReturnValue("biz-123"),
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn().mockReturnValue({
    capture: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

describe("generate-pdf security", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv, BROWSERLESS_API_TOKEN: "test-token-123" };

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", name: "Test User", email: "test@example.com" },
      expires: "2099-01-01",
    } as any);

    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    } as any);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("passes Browserless API token in Authorization header instead of URL parameter", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);

    const validPayload = {
      calculator_id: "concrete-calculator",
      name: "Test Estimate",
      total_cost: 1000,
      results: [{ label: "Concrete Volume", value: 10, unit: "cu yd" }],
      material_list: ["500 lbs Concrete"],
      metadata: {
        title: "Test Estimate",
        calculatorLabel: "Concrete Calculator",
        generatedAt: "2025-01-01T00:00:00Z",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/generate-pdf", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];

    // Ensure token is NOT present in URL query parameters
    expect(url).toBe("https://production-sfo.browserless.io/pdf");
    expect(url).not.toContain("token=");

    // Ensure token IS present in Authorization header
    expect(options?.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token-123",
    });
  });
});
