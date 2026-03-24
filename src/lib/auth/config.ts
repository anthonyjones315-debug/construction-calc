import "server-only";

import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import type { Session } from "./session";

/**
 * Compatibility wrapper around Clerk v7's `auth()` + `currentUser()`.
 *
 * Returns a NextAuth-shaped `{ user: { id, name, email, image } }` object
 * so that existing server pages and data-access layers that call
 * `const session = await auth(); session?.user?.id` continue to work
 * without modification.
 */
export async function auth(): Promise<Session> {
  const { userId } = await clerkAuth();

  if (!userId) {
    return null;
  }

  // Fetch the full Clerk user object for name/email/image.
  // currentUser() is cached per-request so this is cheap.
  const user = await currentUser();

  if (!user) {
    // Edge case: userId is set but the user record is missing.
    return { user: { id: userId } };
  }

  return {
    user: {
      id: user.id,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        null,
      email: user.emailAddresses?.[0]?.emailAddress ?? null,
      image: user.imageUrl ?? null,
    },
  };
}
