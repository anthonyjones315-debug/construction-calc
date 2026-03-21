export type AuthSessionUser = {
  id: string;
  clerkUserId?: string | null;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  business_id?: string | null;
  role?: string;
};

export type AuthSession = {
  user: AuthSessionUser;
} | null;

export type Session = AuthSession;

export type SessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";