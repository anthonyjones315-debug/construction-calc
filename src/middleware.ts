import { NextRequest, NextResponse } from "next/server";

// ─── Routes that require a real human session ────────────────────────────────
// Bots and crawlers that hit these without a valid session cookie are blocked
// immediately — before any auth logic, DB calls, or page rendering.

const PROTECTED_PATHS = [
  "/command-center",
  "/onboarding",
  "/saved",
  "/pricebook",
  "/settings",
  "/api/business-profile",
  "/api/command-center",
  "/api/send",
  "/api/ai",
  "/api/feedback",
];

// ─── Known bot / AI crawler user-agent fragments ─────────────────────────────
// This list blocks common scrapers and AI training crawlers.
// It is intentionally conservative — real browsers are never in this list.
const BOT_UA_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp",          // Yahoo
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "exabot",
  "facebot",
  "facebookexternalhit",
  "ia_archiver",    // Wayback Machine
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "rogerbot",
  "linkedinbot",
  "twitterbot",
  "applebot",
  "petalbot",
  "gptbot",         // OpenAI
  "chatgpt-user",
  "claudebot",      // Anthropic web crawler
  "anthropic-ai",
  "ccbot",          // Common Crawl
  "omgili",
  "diffbot",
  "scrapy",
  "python-requests",
  "python-httpx",
  "axios",
  "wget",
  "curl",
  "go-http-client",
  "java/",
  "ruby",
  "httpclient",
  "okhttp",
  "aiohttp",
  "libwww-perl",
  "lwp-useragent",
] as const;

// ─── No-index response headers for authenticated/private pages ───────────────
// Belt-and-suspenders: even if a bot slips through, these headers tell it
// not to index the page.
const PRIVATE_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => lower.includes(pattern));
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function hasSessionCookie(req: NextRequest): boolean {
  // NextAuth v5 uses __Secure-authjs.session-token (HTTPS) or
  // authjs.session-token (dev/HTTP).
  return (
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("authjs.session-token") ||
    // Legacy next-auth v4 cookie names (in case they coexist during migration)
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only apply to our protected paths
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const ua = req.headers.get("user-agent") ?? "";

  // ── Hard block for known bots on protected paths ─────────────────────────
  if (isBot(ua)) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          ...PRIVATE_HEADERS,
        },
      },
    );
  }

  // ── Requests with no session cookie on protected UI pages → sign-in ──────
  // API routes are not redirected (they return 401 from the handler).
  const isApiPath = pathname.startsWith("/api/");
  if (!isApiPath && !hasSessionCookie(req)) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    const res = NextResponse.redirect(signInUrl);
    // Ensure redirect itself also doesn't get indexed
    Object.entries(PRIVATE_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // ── All other requests: pass through, but stamp no-index headers ──────────
  const res = NextResponse.next();
  Object.entries(PRIVATE_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: [
    "/command-center/:path*",
    "/onboarding/:path*",
    "/saved/:path*",
    "/pricebook/:path*",
    "/settings/:path*",
    "/api/business-profile/:path*",
    "/api/command-center/:path*",
    "/api/send/:path*",
    "/api/ai/:path*",
    "/api/feedback/:path*",
  ],
};
