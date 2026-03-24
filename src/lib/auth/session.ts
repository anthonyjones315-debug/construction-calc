/**
 * Session type — compatibility layer bridging the old NextAuth shape
 * with Clerk v7. Used by `business.ts`, `ensurePublicUser.ts`, and
 * other server-side modules that expect `session.user.*`.
 */
export type Session = {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
} | null;

export type AuthSession = Session;
