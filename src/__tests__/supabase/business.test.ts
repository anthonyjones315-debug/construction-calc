import { describe, it, expect } from "vitest";
import {
  assertNoBusinessIdOverride,
  getTenantScopeColumn,
  getTenantScopeId,
  isBusinessAdminRole,
  canDeleteBusinessData,
  canWriteBusinessData,
  type BusinessContext,
} from "@/lib/supabase/business";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

// Helper to construct a mock business context for testing
function createMockContext(
  overrides: Partial<BusinessContext> = {},
): BusinessContext {
  return {
    userId: "user-123",
    businessId: "biz-456",
    role: "owner",
    isOwner: true,
    isAdmin: true,
    canWriteBusinessData: true,
    canDeleteBusinessData: true,
    usesLegacyUserScope: false,
    ...overrides,
  };
}

describe("assertNoBusinessIdOverride", () => {
  it("allows matching businessId when usesLegacyUserScope is false", () => {
    const context = createMockContext({ usesLegacyUserScope: false, businessId: "biz-456" });
    // Should not throw
    expect(() => assertNoBusinessIdOverride("biz-456", context)).not.toThrow();
  });

  it("allows matching userId when usesLegacyUserScope is true", () => {
    const context = createMockContext({ usesLegacyUserScope: true, userId: "user-123" });
    // Should not throw
    expect(() => assertNoBusinessIdOverride("user-123", context)).not.toThrow();
  });

  it("ignores undefined requestedBusinessId", () => {
    const context = createMockContext();
    expect(() => assertNoBusinessIdOverride(undefined, context)).not.toThrow();
  });

  it("ignores null requestedBusinessId", () => {
    const context = createMockContext();
    expect(() => assertNoBusinessIdOverride(null, context)).not.toThrow();
  });

  it("ignores empty string requestedBusinessId", () => {
    const context = createMockContext();
    expect(() => assertNoBusinessIdOverride("", context)).not.toThrow();
  });

  it("ignores whitespace-only requestedBusinessId", () => {
    const context = createMockContext();
    expect(() => assertNoBusinessIdOverride("   ", context)).not.toThrow();
  });

  it("normalizes and trims requestedBusinessId before checking", () => {
    const context = createMockContext({ usesLegacyUserScope: false, businessId: "biz-456" });
    expect(() => assertNoBusinessIdOverride("  biz-456  ", context)).not.toThrow();
  });

  it("throws UnauthorizedError when businessId mismatches (legacy = false)", () => {
    const context = createMockContext({ usesLegacyUserScope: false, businessId: "biz-456" });
    expect(() => assertNoBusinessIdOverride("other-biz", context)).toThrowError(
      new UnauthorizedError("You cannot write data into another business workspace.")
    );
  });

  it("throws UnauthorizedError when userId mismatches (legacy = true)", () => {
    const context = createMockContext({ usesLegacyUserScope: true, userId: "user-123" });
    expect(() => assertNoBusinessIdOverride("other-user", context)).toThrowError(
      new UnauthorizedError("You cannot write data into another business workspace.")
    );
  });

  it("handles numbers gracefully as requestedBusinessId", () => {
    const context = createMockContext({ usesLegacyUserScope: false, businessId: "123" });
    // Should not throw
    expect(() => assertNoBusinessIdOverride(123, context)).not.toThrow();

    // Should throw on mismatch
    expect(() => assertNoBusinessIdOverride(999, context)).toThrowError(
      new UnauthorizedError("You cannot write data into another business workspace.")
    );
  });
});

describe("getTenantScopeColumn", () => {
  it("returns business_id when usesLegacyUserScope is false", () => {
    const context = createMockContext({ usesLegacyUserScope: false });
    expect(getTenantScopeColumn(context)).toBe("business_id");
  });

  it("returns user_id when usesLegacyUserScope is true", () => {
    const context = createMockContext({ usesLegacyUserScope: true });
    expect(getTenantScopeColumn(context)).toBe("user_id");
  });
});

describe("getTenantScopeId", () => {
  it("returns businessId when usesLegacyUserScope is false", () => {
    const context = createMockContext({ usesLegacyUserScope: false, businessId: "biz-456" });
    expect(getTenantScopeId(context)).toBe("biz-456");
  });

  it("returns userId when usesLegacyUserScope is true", () => {
    const context = createMockContext({ usesLegacyUserScope: true, userId: "user-123" });
    expect(getTenantScopeId(context)).toBe("user-123");
  });
});

describe("isBusinessAdminRole", () => {
  it("returns true for owner and admin roles", () => {
    expect(isBusinessAdminRole("owner")).toBe(true);
    expect(isBusinessAdminRole("admin")).toBe(true);
  });

  it("returns false for member and editor roles", () => {
    expect(isBusinessAdminRole("editor")).toBe(false);
    expect(isBusinessAdminRole("member")).toBe(false);
  });
});

describe("canDeleteBusinessData", () => {
  it("returns true for owner and admin roles", () => {
    expect(canDeleteBusinessData("owner")).toBe(true);
    expect(canDeleteBusinessData("admin")).toBe(true);
  });

  it("returns false for member and editor roles", () => {
    expect(canDeleteBusinessData("editor")).toBe(false);
    expect(canDeleteBusinessData("member")).toBe(false);
  });
});

describe("canWriteBusinessData", () => {
  it("returns true for owner, admin, and editor roles", () => {
    expect(canWriteBusinessData("owner")).toBe(true);
    expect(canWriteBusinessData("admin")).toBe(true);
    expect(canWriteBusinessData("editor")).toBe(true);
  });

  it("returns false for member role", () => {
    expect(canWriteBusinessData("member")).toBe(false);
  });
});
