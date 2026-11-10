import { describe, expect, it } from "vitest";
import { canWriteBusinessData, type MembershipRole } from "@/lib/supabase/business";

/**
 * Validates the authorization check applied on POST /api/materials.
 *
 * Rule: Only users with write permission ("owner", "admin", "editor")
 * can create shared materials. Non-write roles ("member") must be rejected with 403.
 */
function checkCanCreateMaterial(role: MembershipRole): { allowed: boolean; status?: number; error?: string } {
  if (!canWriteBusinessData(role)) {
    return {
      allowed: false,
      status: 403,
      error: "Only owners, admins, or editors can create shared materials.",
    };
  }
  return { allowed: true };
}

describe("materials POST authorization", () => {
  it("allows owners to create materials", () => {
    const result = checkCanCreateMaterial("owner");
    expect(result.allowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("allows admins to create materials", () => {
    const result = checkCanCreateMaterial("admin");
    expect(result.allowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("allows editors to create materials", () => {
    const result = checkCanCreateMaterial("editor");
    expect(result.allowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("blocks members with 403 Forbidden", () => {
    const result = checkCanCreateMaterial("member");
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe("Only owners, admins, or editors can create shared materials.");
  });
});
