import { describe, it, expect } from "vitest";
import {
  assertNoBusinessIdOverride,
  getTenantScopeColumn,
  getTenantScopeId,
  type BusinessContext,
} from "@/lib/supabase/business";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

describe("business module public API", () => {
  describe("assertNoBusinessIdOverride", () => {
    const baseContext: BusinessContext = {
      userId: "user-123",
      businessId: "biz-456",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    };

    it("should not throw if requestedBusinessId is undefined", () => {
      expect(() => assertNoBusinessIdOverride(undefined, baseContext)).not.toThrow();
    });

    it("should not throw if requestedBusinessId is null", () => {
      expect(() => assertNoBusinessIdOverride(null, baseContext)).not.toThrow();
    });

    it("should not throw if requestedBusinessId is empty string", () => {
      expect(() => assertNoBusinessIdOverride("", baseContext)).not.toThrow();
      expect(() => assertNoBusinessIdOverride("   ", baseContext)).not.toThrow();
    });

    describe("with normal tenant scope (usesLegacyUserScope = false)", () => {
      it("should not throw if requestedBusinessId matches context.businessId", () => {
        expect(() => assertNoBusinessIdOverride("biz-456", baseContext)).not.toThrow();
        // Also verify whitespace is trimmed
        expect(() => assertNoBusinessIdOverride(" biz-456  ", baseContext)).not.toThrow();
      });

      it("should throw UnauthorizedError if requestedBusinessId does not match context.businessId", () => {
        expect(() => assertNoBusinessIdOverride("other-biz", baseContext)).toThrowError(
          UnauthorizedError
        );
        expect(() => assertNoBusinessIdOverride("other-biz", baseContext)).toThrow(
          "You cannot write data into another business workspace."
        );
      });
    });

    describe("with legacy tenant scope (usesLegacyUserScope = true)", () => {
      const legacyContext = { ...baseContext, usesLegacyUserScope: true };

      it("should not throw if requestedBusinessId matches context.userId", () => {
        expect(() => assertNoBusinessIdOverride("user-123", legacyContext)).not.toThrow();
      });

      it("should throw UnauthorizedError if requestedBusinessId does not match context.userId", () => {
        expect(() => assertNoBusinessIdOverride("biz-456", legacyContext)).toThrowError(
          UnauthorizedError
        );
      });
    });
  });

  describe("getTenantScopeColumn", () => {
    const baseContext: BusinessContext = {
      userId: "user-123",
      businessId: "biz-456",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    };

    it("should return business_id when usesLegacyUserScope is false", () => {
      expect(getTenantScopeColumn(baseContext)).toBe("business_id");
    });

    it("should return user_id when usesLegacyUserScope is true", () => {
      expect(getTenantScopeColumn({ ...baseContext, usesLegacyUserScope: true })).toBe("user_id");
    });
  });

  describe("getTenantScopeId", () => {
    const baseContext: BusinessContext = {
      userId: "user-123",
      businessId: "biz-456",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    };

    it("should return businessId when usesLegacyUserScope is false", () => {
      expect(getTenantScopeId(baseContext)).toBe("biz-456");
    });

    it("should return userId when usesLegacyUserScope is true", () => {
      expect(getTenantScopeId({ ...baseContext, usesLegacyUserScope: true })).toBe("user-123");
    });
  });
});
