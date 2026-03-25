"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { businessProfiles } from "@/db/schema";

export async function updateProjectStatus(
  projectId: string,
  newStatus: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch user's organization IDs via business_profiles
  const profiles = await db
    .select({ orgId: businessProfiles.organizationId })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, userId));

  const orgIds = profiles
    .map((p) => p.orgId)
    .filter((id): id is string => id !== null);

  if (orgIds.length === 0) throw new Error("No organization found");

  const validStatuses = [
    "lead",
    "quoted",
    "won",
    "lost",
    "completed",
    "scheduled",
    "in_progress",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid status");
  }

  const result = await db
    .update(projects)
    .set({
      status: newStatus as typeof projects.$inferInsert.status,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(projects.id, projectId),
        inArray(projects.organizationId, orgIds),
      ),
    )
    .returning({ id: projects.id });

  if (result.length === 0) {
    throw new Error("Project not found or unauthorized");
  }

  return { success: true };
}
