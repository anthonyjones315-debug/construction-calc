"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function saveCalendarPreferences(
  selectedMemberIds: string[],
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({
      calendarPreferences: { selectedMembers: selectedMemberIds },
    })
    .where(eq(users.id, userId));

  return { success: true };
}
