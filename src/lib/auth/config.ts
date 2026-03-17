import { z } from "zod";
import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createServerClient } from "@/lib/supabase/server";
import { ensurePublicUserRecord } from "@/lib/supabase/ensurePublicUser";
import { issueTwoFactorCode, consumeTwoFactorToken } from "@/lib/tokens";
import {
  clearTwoFactorVerifyFailures,
  getTwoFactorRateLimitKey,
  getTwoFactorResendCooldownSeconds,
  getTwoFactorVerifyLockoutSeconds,
  markTwoFactorResend,
  recordTwoFactorVerifyFailure,
} from "@/lib/auth/two-factor-rate-limit";
import {
  PASSWORD_MAX_LENGTH,
} from "@/lib/security/password-policy";

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
const defaultRedirectProxyUrl =
  process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "development"
    ? `${CANONICAL_SITE_URL}/api/auth`
    : undefined;
const redirectProxyUrl =
  authRedirectProxyEnv && isValidHttpUrl(authRedirectProxyEnv)
    ? authRedirectProxyEnv
    : defaultRedirectProxyUrl;
const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "";
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/)
    .optional()
    .or(z.literal("")),
});
const useSecureCookies =
  process.env.AUTH_FORCE_SECURE_COOKIES === "true" ||
  process.env.NODE_ENV === "production";

class TwoFactorRequiredError extends CredentialsSignin {
  code = "TWO_FACTOR_REQUIRED";
}

class TwoFactorInvalidError extends CredentialsSignin {
  code = "TWO_FACTOR_INVALID";
}

class TwoFactorRateLimitedError extends CredentialsSignin {
  code = "TWO_FACTOR_RATE_LIMITED";
}

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

function getClientIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
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
        code: { label: "Security code", type: "text" },
      },
      async authorize(credentials, request) {
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

        const db = createServerClient();
        const { data: authUser, error: authUserError } = await db
          .from("users")
          .select("two_factor_enabled")
          .eq("id", data.user.id)
          .maybeSingle<{ two_factor_enabled?: boolean | null }>();

        if (authUserError) {
          throw new Error(authUserError.message);
        }

        const twoFactorEnabled = authUser?.two_factor_enabled === true;
        const code = parsed.data.code?.trim() ?? "";

        if (twoFactorEnabled) {
          const ipAddress = getClientIpAddress(request);
          const rateLimitKey = getTwoFactorRateLimitKey(parsed.data.email, ipAddress);

          if (!code) {
            const resendCooldownSeconds =
              getTwoFactorResendCooldownSeconds(rateLimitKey);

            if (resendCooldownSeconds === 0) {
              await issueTwoFactorCode(parsed.data.email);
              markTwoFactorResend(rateLimitKey);
            }

            throw new TwoFactorRequiredError();
          }

          const lockoutSeconds = getTwoFactorVerifyLockoutSeconds(rateLimitKey);
          if (lockoutSeconds > 0) {
            throw new TwoFactorRateLimitedError();
          }

          const isValidCode = await consumeTwoFactorToken(parsed.data.email, code);
          if (!isValidCode) {
            recordTwoFactorVerifyFailure(rateLimitKey);
            throw new TwoFactorInvalidError();
          }

          clearTwoFactorVerifyFailures(rateLimitKey);
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
          twoFactorEnabled,
          twoFactorVerified: !twoFactorEnabled || Boolean(code),
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, credentials }) {
      if (account?.provider !== "credentials") {
        return true;
      }

      const requiresTwoFactor = (user as Record<string, unknown>)?.twoFactorEnabled === true;
      const twoFactorVerified =
        (user as Record<string, unknown>)?.twoFactorVerified === true;
      const submittedCode =
        typeof (credentials as Record<string, unknown> | undefined)?.code === "string"
          ? (credentials as Record<string, unknown>).code
          : "";

      if (requiresTwoFactor && (!submittedCode || !twoFactorVerified)) {
        return false;
      }

      return true;
    },
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
      Sentry.captureException(error, {
        tags: {
          area: "auth",
          source: "nextauth-logger",
        },
        extra: {
          cause: (error as { cause?: unknown })?.cause ?? null,
          redirectProxyUrl: redirectProxyUrl ?? null,
          authSiteUrl: authSiteUrlFromDefaults ?? null,
          vercelEnv: process.env.VERCEL_ENV ?? null,
        },
      });
    },
    warn(code) {
      console.warn("[auth][logger][warn]", code);
    },
  },
});
