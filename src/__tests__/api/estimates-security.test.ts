import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as regenSharePOST } from "@/app/api/estimates/[id]/regen-share/route";
import { POST as finalizePOST } from "@/app/api/estimates/finalize/route";
import * as Sentry from "@sentry/nextjs";

// Mock server-only as empty so it doesn't fail import in Vitest
vi.mock("server-only", () => ({}));

// Mock Sentry
vi.mock("@sentry/nextjs", () => {
  return {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    startSpan: vi.fn((ctx, callback) => callback()),
  };
});

// Mock posthog
vi.mock("@/lib/posthog-server", () => {
  return {
    getPostHogClient: () => ({
      capture: vi.fn(),
      identify: vi.fn(),
      shutdown: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

// Mock auth config
const mockAuth = vi.fn();
vi.mock("@/lib/auth/config", () => ({
  auth: () => mockAuth(),
}));

// Mock supabase server creator
const mockFrom = vi.fn();
const mockSupabaseClient = {
  from: mockFrom,
  schema: vi.fn().mockReturnThis(),
};

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => mockSupabaseClient,
}));

// Mock business contexts
vi.mock("@/lib/supabase/business", () => ({
  canWriteBusinessData: () => true,
  getBusinessContextForSession: vi.fn().mockResolvedValue({
    userId: "user-123",
    businessId: "biz-456",
    role: "owner",
    isOwner: true,
    isAdmin: true,
    canWriteBusinessData: true,
    canDeleteBusinessData: true,
    usesLegacyUserScope: false,
  }),
  getTenantScopeColumn: () => "business_id",
  getTenantScopeId: () => "biz-456",
  assertNoBusinessIdOverride: vi.fn(),
}));

// Mock estimate scope loader
vi.mock("@/lib/supabase/estimate-scope", () => ({
  loadEstimateScope: vi.fn().mockResolvedValue({ ok: true }),
}));

// Mock name generator
vi.mock("@/lib/estimates/name-generator", () => ({
  generateAutoEstimateName: vi.fn().mockResolvedValue("Generated Project Name"),
}));

describe("API Security Hardening against Internal DB leakage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("/api/estimates/[id]/regen-share", () => {
    it("returns 'Internal Server Error' and calls Sentry when a database error occurs, instead of leaking raw message", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", email: "test@example.com" },
      });

      // Mock the db.from().select() to return a database error
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: "42P01",
            message:
              'relation "saved_estimates" does not exist or connection refused by driver',
          },
        }),
      });

      const req = new NextRequest(
        "http://localhost/api/estimates/123/regen-share",
        {
          method: "POST",
        },
      );

      const response = await regenSharePOST(req, {
        params: Promise.resolve({ id: "123" }),
      });
      expect(response.status).toBe(500);

      const body = await response.json();
      // Ensure raw error message is NOT leaked
      expect(body.error).toBe("Internal Server Error");
      expect(body.error).not.toContain("relation");
      expect(body.error).not.toContain("does not exist");

      // Verify Sentry was notified of the actual exception
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  describe("/api/estimates/finalize", () => {
    it("returns 'Internal Server Error' when general database/query exception is thrown, instead of leaking raw message", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", email: "test@example.com" },
      });

      // Mock the db.from().select() to throw / return error during contractor profile or estimate lookup
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: "CONNECTION_FAILURE",
            message:
              "Fatal database connection socket timed out at postgres://abc:123@host",
          },
        }),
      });

      // Prepare a valid minimal body payload for finalizing an estimate
      const payload = {
        name: "Kitchen Remodel",
        calculator_id: "interior/flooring-waste",
        client_name: "Jane Contractor",
        job_site_address: "123 Main St",
        total_cost: 1000,
        results: [{ label: "Total Cents", value: 100000, unit: "cents" }],
        material_list: ["Flooring"],
        inputs: {},
        metadata: {
          title: "Flooring Estimate",
          calculatorLabel: "Flooring",
          generatedAt: new Date().toISOString(),
          jobName: "Kitchen Remodel",
        },
      };

      const req = new NextRequest("http://localhost/api/estimates/finalize", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const response = await finalizePOST(req);
      expect(response.status).toBe(500);

      const body = await response.json();
      // Ensure raw database credentials or connection failure info is NOT leaked
      expect(body.error).toBe("Internal Server Error");
      expect(body.error).not.toContain("postgres://");
      expect(body.error).not.toContain("abc:123");
      expect(body.error).not.toContain("Fatal database connection");

      // Verify Sentry captured the exception
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });
});
