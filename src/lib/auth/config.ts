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
const redirectProxyUrl =
  process.env.AUTH_REDIRECT_PROXY_URL ??
  (authSiteUrl ? new URL("/api/auth", authSiteUrl).toString() : undefined);

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
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  useSecureCookies:
    authSiteUrl?.startsWith("https://") ??
    process.env.NODE_ENV === "production",
  redirectProxyUrl,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
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
});
