import { z } from "zod";
import NextAuth from "next-auth";
import { createClient } from "@supabase/supabase-js";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ensurePublicUserRecord } from "@/lib/supabase/ensurePublicUser";

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabaseReady =
  isValidHttpUrl(supabaseUrl) && supabaseServiceKey.length > 0;
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
const CANONICAL_SITE_URL = "https://proconstructioncalc.com";
const authSiteUrlFromEnv = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
const authSiteUrlFromDefaults =
  authSiteUrlFromEnv ??
  (process.env.VERCEL_ENV === "production" ? CANONICAL_SITE_URL : undefined);
const trustHost = process.env.AUTH_TRUST_HOST !== "false";
const authRedirectProxyEnv = process.env.AUTH_REDIRECT_PROXY_URL;
const redirectProxyUrl =
  authRedirectProxyEnv && isValidHttpUrl(authRedirectProxyEnv)
    ? authRedirectProxyEnv
    : undefined;
const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "";
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
const useSecureCookies =
  process.env.AUTH_FORCE_SECURE_COOKIES === "true" ||
  process.env.NODE_ENV === "production";

function reportAuthConfigIssues() {
  const issues: string[] = [];

  if (!authSecret) {
    issues.push("AUTH_SECRET (or NEXTAUTH_SECRET) is missing");
  }

  if (process.env.VERCEL_ENV === "production" && !authSiteUrlFromEnv) {
    issues.push("NEXTAUTH_URL (or AUTH_URL fallback) is missing in production");
  }

  if (!googleClientId) {
    issues.push(
      "Google client id missing (set GOOGLE_CLIENT_ID or AUTH_GOOGLE_ID)",
    );
  }

  if (!googleClientSecret) {
    issues.push(
      "Google client secret missing (set GOOGLE_CLIENT_SECRET or AUTH_GOOGLE_SECRET)",
    );
  }

  if (!isValidHttpUrl(supabaseUrl)) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL is missing or invalid");
  }

  if (!supabaseServiceKey) {
    issues.push("SUPABASE_SERVICE_ROLE_KEY is missing");
  }

  if (!supabaseAnonKey) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
  }

  if (process.env.NODE_ENV !== "production" && authSiteUrlFromEnv) {
    try {
      const normalizedAuthSiteUrl = new URL(authSiteUrlFromEnv);
      if (
        normalizedAuthSiteUrl.origin !== "http://localhost:3000" &&
        normalizedAuthSiteUrl.origin !== "https://localhost:3000"
      ) {
        issues.push(
          `NEXTAUTH_URL/AUTH_URL is ${normalizedAuthSiteUrl.origin}. Expected http://localhost:3000 during local development.`,
        );
      }
    } catch {
      issues.push("NEXTAUTH_URL/AUTH_URL is invalid");
    }
  }

  if (!issues.length) return;

  if (authSiteUrlFromDefaults) {
    console.info(`[auth] effective site url: ${authSiteUrlFromDefaults}`);
  }

  console.error("[auth] configuration issues detected:");
  for (const issue of issues) {
    console.error(`[auth] - ${issue}`);
  }
}

reportAuthConfigIssues();

function createSupabaseAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

function toSameOriginRedirect(url: string, baseUrl: string): string {
  const runtimeOrigin = new URL(baseUrl).origin;

  if (url.startsWith("/")) {
    return new URL(url, runtimeOrigin).toString();
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin === runtimeOrigin ? parsedUrl.toString() : baseUrl;
  } catch {
    return baseUrl;
  }
}

function applyTokenFallback(token: Record<string, unknown>) {
  if (!("business_id" in token)) {
    token.business_id = null;
  }

  if (typeof token.role !== "string") {
    token.role = "none";
  }
}

function withFallbackSession<
  TSession extends {
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  },
>(session: TSession, userId?: string): TSession {
  const nextUser = {
    ...(session.user ?? {}),
    ...(userId ? { id: userId } : {}),
    business_id: null as string | null,
    role: "none" as const,
  };

  const nextSession = {
    ...session,
    user: nextUser,
  };

  return nextSession as TSession;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.AUTH_DEBUG === "true",
  secret: authSecret || undefined,
  trustHost,
  useSecureCookies,
  redirectProxyUrl,
  cookies: {
    state: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15,
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15,
      },
    },
  },

  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      checks: ["state"],
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials ?? {});
        if (!parsed.success) return null;

        if (!isValidHttpUrl(supabaseUrl) || !supabaseAnonKey) {
          return null;
        }

        const supabaseAuth = createSupabaseAuthClient();
        const { data, error } = await supabaseAuth.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });

        if (error || !data.user) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email || parsed.data.email,
          name:
            typeof data.user.user_metadata?.name === "string"
              ? data.user.user_metadata.name
              : typeof data.user.user_metadata?.full_name === "string"
                ? data.user.user_metadata.full_name
                : data.user.email,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      const mutableToken = token as typeof token & Record<string, unknown>;

      try {
        // Only runs on initial sign-in (account is defined)
        if (account && user) {
          // Always seed from what next-auth gives us first
          if (user.id) token.sub = user.id;
          if (user.email) token.email = user.email;
          if (user.name) token.name = user.name;

          // Google OAuth: look up or create a stable Supabase UUID by email
          if (account.provider === "google" && user.email && supabaseReady) {
            try {
              const adminDb = createClient(supabaseUrl, supabaseServiceKey, {
                auth: { persistSession: false },
              });
              const { data: existing } = await adminDb
                .from("users")
                .select("id")
                .eq("email", user.email)
                .maybeSingle();
              const nextUserId = existing?.id ?? crypto.randomUUID();
              token.sub = await ensurePublicUserRecord(adminDb, {
                id: nextUserId,
                email: user.email,
                name: user.name ?? null,
                image: (user as { image?: string | null }).image ?? null,
              });
            } catch {
              // DB lookup failed — keep the Google-provided ID as fallback.
              // ensurePublicUser on the command center page handles reconciliation.
            }
          }
        }

        if (!token.sub && typeof token.email === "string" && supabaseReady) {
          try {
            const adminDb = createClient(supabaseUrl, supabaseServiceKey, {
              auth: { persistSession: false },
            });
            const { data: existing } = await adminDb
              .from("users")
              .select("id")
              .eq("email", token.email)
              .maybeSingle();
            if (existing?.id) {
              token.sub = existing.id;
            }
          } catch {
            // Keep token as-is if fallback user lookup fails.
          }
        }
      } catch {
        applyTokenFallback(mutableToken);
        return token;
      }

      applyTokenFallback(mutableToken);

      return token;
    },
    async session({ session, user, token }) {
      try {
        // Attach user ID to session so components can query saved estimates.
        // For JWT strategy, user can be undefined on subsequent requests,
        // so fall back to token.sub to keep behavior consistent across providers.
        let userId = user?.id ?? token?.sub;

        if (!userId && typeof token?.email === "string" && supabaseReady) {
          try {
            const adminDb = createClient(supabaseUrl, supabaseServiceKey, {
              auth: { persistSession: false },
            });
            const { data: existing } = await adminDb
              .from("users")
              .select("id")
              .eq("email", token.email)
              .maybeSingle();
            if (existing?.id) {
              userId = existing.id;
            }
          } catch {
            // Keep session as-is if user lookup fails.
          }
        }

        return withFallbackSession(session, userId);
      } catch {
        return withFallbackSession(
          session,
          user?.id ?? (typeof token?.sub === "string" ? token.sub : undefined),
        );
      }
    },
    redirect({ url, baseUrl }) {
      return toSameOriginRedirect(url, baseUrl);
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
  },

  logger: {
    error(error) {
      console.error(
        "[auth][logger][error]",
        error?.name ?? "unknown",
        error?.message ?? "",
        // Log the root cause which contains the actual DB/adapter error
        (error as { cause?: unknown })?.cause ?? "",
      );
    },
    warn(code) {
      console.warn("[auth][logger][warn]", code);
    },
  },
});
