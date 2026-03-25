"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { businesses, memberships, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Invite a user to join a tenant/business by email.
 * Only the business owner can perform this action.
 */
export async function inviteTeamMember(
  businessId: string,
  email: string,
  role: string = "member",
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify the calling user owns this business
  const [business] = await db
    .select({ id: businesses.id, seatLimit: businesses.seatLimit })
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, userId)))
    .limit(1);

  if (!business) throw new Error("Business not found or not the owner");

  // Check seat limit
  const currentMembers = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(eq(memberships.businessId, businessId));

  if (currentMembers.length >= business.seatLimit) {
    throw new Error(
      `Seat limit reached (${business.seatLimit}). Upgrade your plan to add more members.`,
    );
  }

  // Look up the user by email
  const [targetUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!targetUser) {
    throw new Error(
      "No user found with that email. They must create an account first.",
    );
  }

  // Check for existing membership
  const [existing] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.businessId, businessId),
        eq(memberships.userId, targetUser.id),
      ),
    )
    .limit(1);

  if (existing) throw new Error("This user is already a member of your team");

  // Validate role
  const validRoles = ["owner", "admin", "editor", "member"];
  if (!validRoles.includes(role)) throw new Error("Invalid role");

  // Create membership
  const [membership] = await db
    .insert(memberships)
    .values({
      businessId,
      userId: targetUser.id,
      role,
    })
    .returning({ id: memberships.id });

  return {
    success: true,
    membershipId: membership.id,
    message: `${email} has been added as ${role}`,
  };
}

/**
 * Remove a team member from a business.
 */
export async function removeTeamMember(
  businessId: string,
  membershipId: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, userId)))
    .limit(1);

  if (!business) throw new Error("Business not found or not the owner");

  await db.delete(memberships).where(eq(memberships.id, membershipId));

  return { success: true };
}
