/**
 * Smoke tests — role capability matrix
 *
 * Verifies that each role (owner / admin / editor / member) receives
 * the correct set of boolean capabilities from the business context
 * helper functions in src/lib/supabase/business.ts.
 *
 * These are pure-function tests — no DB, no network, no mocks needed.
 */

import { describe, it, expect } from "vitest";
import {
  isBusinessAdminRole,
  canWriteBusinessData,
  canDeleteBusinessData,
  type MembershipRole,
} from "@/lib/supabase/business";

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
