import { describe, it, expect } from "vitest";
import {
  assertNoBusinessIdOverride,
  getTenantScopeColumn,
  getTenantScopeId,
  isBusinessAdminRole,
  canWriteBusinessData,
  canDeleteBusinessData,
  type BusinessContext,
  type MembershipRole,
} from "../business";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

// ---------------------------------------------------------------------------
// Helper: build the same capability object that buildBusinessCapabilities()
// produces inside business.ts so we can assert the full matrix in one place.
// ---------------------------------------------------------------------------
function buildCapabilities(role: MembershipRole) {
  return {
    isOwner: role === "owner",
    isAdmin: isBusinessAdminRole(role),
    canWriteBusinessData: canWriteBusinessData(role),
    canDeleteBusinessData: canDeleteBusinessData(role),
  };
}

describe("assertNoBusinessIdOverride", () => {
  const baseContext: BusinessContext = {
    userId: "user-123",
    businessId: "business-123",
    role: "owner",
    isOwner: true,
    isAdmin: true,
    canWriteBusinessData: true,
    canDeleteBusinessData: true,
    usesLegacyUserScope: false,
  };

  const legacyContext: BusinessContext = {
    ...baseContext,
    usesLegacyUserScope: true,
  };

  it("does not throw when requested business ID is undefined", () => {
    expect(() => assertNoBusinessIdOverride(undefined, baseContext)).not.toThrow();
  });

  it("does not throw when requested business ID is null", () => {
    expect(() => assertNoBusinessIdOverride(null, baseContext)).not.toThrow();
  });

  it("does not throw when requested business ID is empty string", () => {
    expect(() => assertNoBusinessIdOverride("", baseContext)).not.toThrow();
  });

  it("does not throw when requested business ID is whitespace", () => {
    expect(() => assertNoBusinessIdOverride("   ", baseContext)).not.toThrow();
  });

  it("does not throw when requested business ID matches business ID (modern scope)", () => {
    expect(() => assertNoBusinessIdOverride("business-123", baseContext)).not.toThrow();
  });

  it("throws when requested business ID does not match business ID (modern scope)", () => {
    expect(() => assertNoBusinessIdOverride("business-456", baseContext)).toThrow(UnauthorizedError);
  });

  it("does not throw when requested business ID matches user ID (legacy scope)", () => {
    expect(() => assertNoBusinessIdOverride("user-123", legacyContext)).not.toThrow();
  });

  it("throws when requested business ID does not match user ID (legacy scope)", () => {
    expect(() => assertNoBusinessIdOverride("business-123", legacyContext)).toThrow(UnauthorizedError);
  });
});

describe("getTenantScopeColumn", () => {
  it("returns 'business_id' when not using legacy scope", () => {
    const context: BusinessContext = {
      userId: "user-123",
      businessId: "business-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    };
    expect(getTenantScopeColumn(context)).toBe("business_id");
  });

  it("returns 'user_id' when using legacy scope", () => {
    const context: BusinessContext = {
      userId: "user-123",
      businessId: "business-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: true,
    };
    expect(getTenantScopeColumn(context)).toBe("user_id");
  });
});

describe("getTenantScopeId", () => {
  it("returns the businessId when not using legacy scope", () => {
    const context: BusinessContext = {
      userId: "user-123",
      businessId: "business-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: false,
    };
    expect(getTenantScopeId(context)).toBe("business-123");
  });

  it("returns the userId when using legacy scope", () => {
    const context: BusinessContext = {
      userId: "user-123",
      businessId: "business-123",
      role: "owner",
      isOwner: true,
      isAdmin: true,
      canWriteBusinessData: true,
      canDeleteBusinessData: true,
      usesLegacyUserScope: true,
    };
    expect(getTenantScopeId(context)).toBe("user-123");
  });
});

// ---------------------------------------------------------------------------
// Role matrix
// ---------------------------------------------------------------------------
describe("Role capability matrix", () => {
  describe("owner", () => {
    const caps = buildCapabilities("owner");

    it("isOwner = true", () => expect(caps.isOwner).toBe(true));
    it("isAdmin = true", () => expect(caps.isAdmin).toBe(true));
    it("canWriteBusinessData = true", () => expect(caps.canWriteBusinessData).toBe(true));
    it("canDeleteBusinessData = true", () => expect(caps.canDeleteBusinessData).toBe(true));
  });

  describe("admin", () => {
    const caps = buildCapabilities("admin");

    it("isOwner = false", () => expect(caps.isOwner).toBe(false));
    it("isAdmin = true", () => expect(caps.isAdmin).toBe(true));
    it("canWriteBusinessData = true", () => expect(caps.canWriteBusinessData).toBe(true));
    it("canDeleteBusinessData = true", () => expect(caps.canDeleteBusinessData).toBe(true));
  });

  describe("editor", () => {
    const caps = buildCapabilities("editor");

    it("isOwner = false", () => expect(caps.isOwner).toBe(false));
    it("isAdmin = false", () => expect(caps.isAdmin).toBe(false));
    it("canWriteBusinessData = true", () => expect(caps.canWriteBusinessData).toBe(true));
    it("canDeleteBusinessData = false", () => expect(caps.canDeleteBusinessData).toBe(false));
  });

  describe("member", () => {
    const caps = buildCapabilities("member");

    it("isOwner = false", () => expect(caps.isOwner).toBe(false));
    it("isAdmin = false", () => expect(caps.isAdmin).toBe(false));
    it("canWriteBusinessData = false", () => expect(caps.canWriteBusinessData).toBe(false));
    it("canDeleteBusinessData = false", () => expect(caps.canDeleteBusinessData).toBe(false));
  });
});

// ---------------------------------------------------------------------------
// isBusinessAdminRole — explicit edge cases
// ---------------------------------------------------------------------------
describe("isBusinessAdminRole", () => {
  it("returns true for owner", () => expect(isBusinessAdminRole("owner")).toBe(true));
  it("returns true for admin", () => expect(isBusinessAdminRole("admin")).toBe(true));
  it("returns false for editor", () => expect(isBusinessAdminRole("editor")).toBe(false));
  it("returns false for member", () => expect(isBusinessAdminRole("member")).toBe(false));
});

// ---------------------------------------------------------------------------
// canWriteBusinessData — write roles
// ---------------------------------------------------------------------------
describe("canWriteBusinessData", () => {
  it("owner can write", () => expect(canWriteBusinessData("owner")).toBe(true));
  it("admin can write", () => expect(canWriteBusinessData("admin")).toBe(true));
  it("editor can write", () => expect(canWriteBusinessData("editor")).toBe(true));
  it("member cannot write", () => expect(canWriteBusinessData("member")).toBe(false));
});

// ---------------------------------------------------------------------------
// canDeleteBusinessData — delete roles
// ---------------------------------------------------------------------------
describe("canDeleteBusinessData", () => {
  it("owner can delete", () => expect(canDeleteBusinessData("owner")).toBe(true));
  it("admin can delete", () => expect(canDeleteBusinessData("admin")).toBe(true));
  it("editor cannot delete", () => expect(canDeleteBusinessData("editor")).toBe(false));
  it("member cannot delete", () => expect(canDeleteBusinessData("member")).toBe(false));
});
