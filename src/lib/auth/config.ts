import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

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
const CANONICAL_SITE_URL = "https://proconstructioncalc.com";
const authSiteUrl =
  process.env.AUTH_URL ??
  (process.env.VERCEL_ENV === "production" ? CANONICAL_SITE_URL : undefined);
const authRedirectProxyEnv = process.env.AUTH_REDIRECT_PROXY_URL;
const redirectProxyUrl =
  authRedirectProxyEnv && isValidHttpUrl(authRedirectProxyEnv)
    ? authRedirectProxyEnv
    : undefined;
const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "";
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "";

function reportAuthConfigIssues() {
  const issues: string[] = [];

  if (!process.env.AUTH_SECRET) {
    issues.push("AUTH_SECRET is missing");
  }

  if (process.env.VERCEL_ENV === "production" && !authSiteUrl) {
    issues.push("AUTH_URL is missing in production");
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

  if (!issues.length) return;

  console.error("[auth] configuration issues detected:");
  for (const issue of issues) {
    console.error(`[auth] - ${issue}`);
  }
}

reportAuthConfigIssues();

function toSameOriginRedirect(url: string, baseUrl: string): string {
  const expectedBaseUrl = authSiteUrl ?? baseUrl;
  const expectedOrigin = new URL(expectedBaseUrl).origin;

  if (url.startsWith("/")) {
    return new URL(url, expectedOrigin).toString();
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin === expectedOrigin
      ? parsedUrl.toString()
      : expectedBaseUrl;
  } catch {
    return expectedBaseUrl;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.AUTH_DEBUG === "true",
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  useSecureCookies:
    authSiteUrl?.startsWith("https://") ??
    process.env.NODE_ENV === "production",
  redirectProxyUrl,
  cookies: {
    state: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure:
          authSiteUrl?.startsWith("https://") ??
          process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes — enough for an OAuth round-trip
      },
    },
    pkceCodeVerifier: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure:
          authSiteUrl?.startsWith("https://") ??
          process.env.NODE_ENV === "production",
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
  ],

  // Wire Supabase as the database adapter — saves users/sessions to your Supabase DB
  // Only active when env vars are present AND the URL is a valid HTTP/S URL
  adapter: supabaseReady
    ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseServiceKey })
    : undefined,

  callbacks: {
    session({ session, user }) {
      // Attach user ID to session so components can query saved estimates
      if (user?.id) session.user.id = user.id;
      return session;
    },
    redirect({ url, baseUrl }) {
      return toSameOriginRedirect(url, baseUrl);
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  // JWT sessions when no adapter (local dev fallback), DB sessions when Supabase is active
  session: {
    strategy: supabaseReady ? "database" : "jwt",
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
