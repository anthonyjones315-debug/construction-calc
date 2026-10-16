import { describe, expect, it } from "vitest";
import { canWriteBusinessData, type MembershipRole } from "@/lib/supabase/business";

/**
 * Security unit tests for /api/materials authorization.
 * Verifies that role-based access control (RBAC) allows write-capable roles
 * (owner, admin, editor) and strictly blocks non-write roles (member) from
 * creating shared materials.
 */
describe("POST /api/materials authorization check", () => {
  it("allows owner role to create shared materials", () => {
    const role: MembershipRole = "owner";
    expect(canWriteBusinessData(role)).toBe(true);
  });

  it("allows admin role to create shared materials", () => {
    const role: MembershipRole = "admin";
    expect(canWriteBusinessData(role)).toBe(true);
  });

  it("allows editor role to create shared materials", () => {
    const role: MembershipRole = "editor";
    expect(canWriteBusinessData(role)).toBe(true);
  });

  it("blocks member role from creating shared materials (returns 403 Forbidden)", () => {
    const role: MembershipRole = "member";
    expect(canWriteBusinessData(role)).toBe(false);
  });
});
