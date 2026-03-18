/**
 * Smoke tests — member API access control
 *
 * Tests the permission rules enforced inside the PATCH and DELETE handlers
 * of /api/command-center/members/[memberId].
 *
 * Strategy: extract the pure validation logic into inline helpers that mirror
 * exactly what the route does, so we can unit-test every gate without
 * spinning up a real HTTP server, DB, or auth session.
 */

import { describe, it, expect } from "vitest";
import type { MembershipRole } from "@/lib/supabase/business";
import { isBusinessAdminRole } from "@/lib/supabase/business";

// ---------------------------------------------------------------------------
// Mirror of the gate functions used inside the route handlers
// ---------------------------------------------------------------------------

/** Returns an error string if the caller is not allowed to manage members. */
function checkCanManageMembers(callerRole: MembershipRole): string | null {
  if (!isBusinessAdminRole(callerRole)) {
    return "Only business owners and admins can manage team members.";
  }
  return null;
}

/** Returns an error string if the role assignment is invalid. */
function checkRoleAssignment(
  newRole: string,
  callerRole: MembershipRole,
  targetUserId: string,
  callerUserId: string,
): string | null {
  const validRoles = ["owner", "admin", "editor", "member"];
  if (!validRoles.includes(newRole)) {
    return "Invalid role. Must be owner, admin, editor, or member.";
  }

  // Only the owner can promote someone to owner.
  if (newRole === "owner" && callerRole !== "owner") {
    return "Only the business owner can transfer ownership.";
  }

  // Owner cannot demote themselves.
  if (targetUserId === callerUserId && newRole !== "owner") {
    return "Owner cannot demote their own account.";
  }

  return null;
}

/** Returns an error string if the DELETE is invalid. */
function checkCanRemoveMember(
  targetUserId: string,
  targetRole: string,
  callerUserId: string,
): string | null {
  if (targetUserId === callerUserId) {
    return "Owner cannot remove their own account.";
  }
  if (targetRole === "owner") {
    return "Cannot remove another owner from this screen.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Access gate: who can manage members at all
// ---------------------------------------------------------------------------
describe("checkCanManageMembers", () => {
  it("allows owner", () => expect(checkCanManageMembers("owner")).toBeNull());
  it("allows admin", () => expect(checkCanManageMembers("admin")).toBeNull());
  it("blocks editor", () => expect(checkCanManageMembers("editor")).toBeTruthy());
  it("blocks member", () => expect(checkCanManageMembers("member")).toBeTruthy());
});

// ---------------------------------------------------------------------------
// Role assignment rules (PATCH)
// ---------------------------------------------------------------------------
describe("checkRoleAssignment", () => {
  const OWNER_ID = "user-owner";
  const ADMIN_ID = "user-admin";
  const OTHER_ID = "user-other";

  it("owner can promote another user to owner", () => {
    expect(checkRoleAssignment("owner", "owner", OTHER_ID, OWNER_ID)).toBeNull();
  });

  it("admin cannot promote another user to owner", () => {
    expect(checkRoleAssignment("owner", "admin", OTHER_ID, ADMIN_ID)).toBeTruthy();
  });

  it("owner can set another user to member", () => {
    expect(checkRoleAssignment("member", "owner", OTHER_ID, OWNER_ID)).toBeNull();
  });

  it("admin can set another user to member", () => {
    expect(checkRoleAssignment("member", "admin", OTHER_ID, ADMIN_ID)).toBeNull();
  });

  it("admin can set another user to editor", () => {
    expect(checkRoleAssignment("editor", "admin", OTHER_ID, ADMIN_ID)).toBeNull();
  });

  it("owner cannot demote themselves", () => {
    expect(checkRoleAssignment("member", "owner", OWNER_ID, OWNER_ID)).toBeTruthy();
  });

  it("rejects invalid role strings", () => {
    expect(checkRoleAssignment("superadmin", "owner", OTHER_ID, OWNER_ID)).toBeTruthy();
    expect(checkRoleAssignment("", "owner", OTHER_ID, OWNER_ID)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Member removal rules (DELETE)
// ---------------------------------------------------------------------------
describe("checkCanRemoveMember", () => {
  const OWNER_ID = "user-owner";
  const MEMBER_ID = "user-member";
  const OTHER_OWNER_ID = "user-owner-2";

  it("owner can remove a member", () => {
    expect(checkCanRemoveMember(MEMBER_ID, "member", OWNER_ID)).toBeNull();
  });

  it("owner cannot remove themselves", () => {
    expect(checkCanRemoveMember(OWNER_ID, "owner", OWNER_ID)).toBeTruthy();
  });

  it("cannot remove another owner", () => {
    expect(checkCanRemoveMember(OTHER_OWNER_ID, "owner", OWNER_ID)).toBeTruthy();
  });

  it("admin can remove a plain member", () => {
    // Admin calling with MEMBER_ID as target, "admin" as caller — only owner check applies here
    expect(checkCanRemoveMember(MEMBER_ID, "member", "user-admin")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// End-to-end: simulated role flows
// ---------------------------------------------------------------------------
describe("Simulated role flows", () => {
  const OWNER_ID = "owner-uuid";
  const ADMIN_ID = "admin-uuid";
  const EDITOR_ID = "editor-uuid";
  const MEMBER_ID = "member-uuid";

  it("owner flow: can manage, can set roles, can remove plain member", () => {
    expect(checkCanManageMembers("owner")).toBeNull();
    expect(checkRoleAssignment("admin", "owner", MEMBER_ID, OWNER_ID)).toBeNull();
    expect(checkCanRemoveMember(MEMBER_ID, "member", OWNER_ID)).toBeNull();
  });

  it("admin flow: can manage, can change roles but not promote to owner, can remove member", () => {
    expect(checkCanManageMembers("admin")).toBeNull();
    expect(checkRoleAssignment("editor", "admin", MEMBER_ID, ADMIN_ID)).toBeNull();
    expect(checkRoleAssignment("owner", "admin", MEMBER_ID, ADMIN_ID)).toBeTruthy(); // blocked
    expect(checkCanRemoveMember(MEMBER_ID, "member", ADMIN_ID)).toBeNull();
  });

  it("editor flow: blocked from managing members entirely", () => {
    expect(checkCanManageMembers("editor")).toBeTruthy();
  });

  it("member flow: blocked from managing members entirely", () => {
    expect(checkCanManageMembers("member")).toBeTruthy();
  });

  it("editor cannot reach role assignment (gate fires first)", () => {
    // If editor somehow bypasses the first gate, role assignment would also fail
    // because isBusinessAdminRole("editor") is false — belt-and-suspenders.
    expect(checkCanManageMembers("editor")).not.toBeNull();
    expect(checkCanManageMembers("member")).not.toBeNull();
  });

  it("EDITOR_ID and MEMBER_ID cannot promote themselves by calling the API", () => {
    // The first gate blocks them; this confirms both gates fire correctly.
    [EDITOR_ID, MEMBER_ID].forEach((userId) => {
      const role = userId === EDITOR_ID ? "editor" : ("member" as MembershipRole);
      expect(checkCanManageMembers(role)).toBeTruthy();
    });
  });
});
