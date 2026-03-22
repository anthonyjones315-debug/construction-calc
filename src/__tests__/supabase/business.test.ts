import { describe, it, expect } from "vitest";
import { getTenantScopeColumn, getTenantScopeId, type BusinessContext } from "@/lib/supabase/business";

describe("Business Context Utilities", () => {
  const mockUserId = "user-123";
  const mockBusinessId = "business-456";

  const legacyContext: BusinessContext = {
    userId: mockUserId,
    businessId: mockBusinessId,
    role: "owner",
    isOwner: true,
    isAdmin: true,
    canWriteBusinessData: true,
    canDeleteBusinessData: true,
    usesLegacyUserScope: true,
  };

  const modernContext: BusinessContext = {
    userId: mockUserId,
    businessId: mockBusinessId,
    role: "owner",
    isOwner: true,
    isAdmin: true,
    canWriteBusinessData: true,
    canDeleteBusinessData: true,
    usesLegacyUserScope: false,
  };

  describe("getTenantScopeColumn", () => {
    it("returns 'user_id' when usesLegacyUserScope is true", () => {
      expect(getTenantScopeColumn(legacyContext)).toBe("user_id");
    });

    it("returns 'business_id' when usesLegacyUserScope is false", () => {
      expect(getTenantScopeColumn(modernContext)).toBe("business_id");
    });
  });

  describe("getTenantScopeId", () => {
    it("returns userId when usesLegacyUserScope is true", () => {
      expect(getTenantScopeId(legacyContext)).toBe(mockUserId);
    });

    it("returns businessId when usesLegacyUserScope is false", () => {
      expect(getTenantScopeId(modernContext)).toBe(mockBusinessId);
    });
  });
});
