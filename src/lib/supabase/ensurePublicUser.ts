import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "next-auth";

function isMissingPublicUsersTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("could not find the table 'public.users'") ||
    lower.includes('relation "public.users" does not exist') ||
    lower.includes("schema cache")
  );
}

/**
 * Ensures the authenticated user exists in public.users.
 * The sync trigger handles new sign-ins, but existing sessions created before
 * the trigger was set up may be missing from public.users.
 */
export async function ensurePublicUser(db: SupabaseClient, session: Session) {
  const { user } = session;
  if (!user?.id) return;
  const { error } = await db
    .schema("public")
    .from("users")
    .upsert(
      {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        image: user.image ?? null,
      },
      { onConflict: "id" },
    );
  if (error) {
    if (isMissingPublicUsersTableError(error.message)) {
      console.warn(
        `ensurePublicUser skipped [uid:${user.id}]: public.users table not found in this environment`,
      );
      return;
    }

    throw new Error(
      `ensurePublicUser failed [uid:${user.id}]: ${error.message}`,
    );
  }
}
