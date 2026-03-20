import { auth } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "proconstructioncalc.com";
const LEGACY_HOSTS = new Set(["www.proconstructioncalc.com"]);
const PROTECTED_PATH_PREFIXES = [
  "/saved",
  "/pricebook",
  "/settings",
  "/command-center",
  "/onboarding",
];

// ── Bot / AI crawler user-agent fragments ────────────────────────────────────
// Hard-blocks known scrapers, AI training crawlers, and headless tools on
// protected paths before any auth, DB, or page rendering work happens.
const BOT_UA_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "exabot",
  "facebot",
  "facebookexternalhit",
  "ia_archiver",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "rogerbot",
  "linkedinbot",
  "twitterbot",
  "applebot",
  "petalbot",
  "gptbot",
  "chatgpt-user",
  "claudebot",
  "anthropic-ai",
  "ccbot",
  "omgili",
  "diffbot",
  "scrapy",
  "python-requests",
  "python-httpx",
  "axios/",
  "wget/",
  "curl/",
  "go-http-client",
  "java/",
  "ruby",
  "httpclient",
  "okhttp",
  "aiohttp",
  "libwww-perl",
  "lwp-useragent",
] as const;

// No-index headers stamped on every protected response (belt-and-suspenders
// on top of the robots.txt disallow rules).
const PRIVATE_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => lower.includes(pattern));
}

function getNextPath(pathname: string, search: string): string {
  return `${pathname}${search}` || "/";
}

function getRequestOrigin(req: NextRequest): string {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost ?? req.headers.get("host");

  if (host) {
    const protocol =
      forwardedProto ??
      (host.includes("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${protocol}://${host}`;
  }

  return req.nextUrl.origin;
}

function isPrefetchRequest(req: NextRequest): boolean {
  const purpose = req.headers.get("purpose");
  const nextRouterPrefetch = req.headers.get("next-router-prefetch");
  const nextRouterSegmentPrefetch = req.headers.get(
    "next-router-segment-prefetch",
  );

  return (
    purpose === "prefetch" ||
    nextRouterPrefetch !== null ||
    nextRouterSegmentPrefetch !== null
  );
}

export default auth(function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const host = req.nextUrl.hostname.toLowerCase();

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ── Canonical host redirect ───────────────────────────────────────────────
  if (LEGACY_HOSTS.has(host)) {
    return NextResponse.redirect(
      `https://${CANONICAL_HOST}${pathname}${search}`,
      308,
    );
  }

  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/error")
  ) {
    return NextResponse.next();
  }

  // ── Bot hard-block on protected paths ────────────────────────────────────
  if (isProtectedPath(pathname)) {
    const ua = req.headers.get("user-agent") ?? "";
    if (isBot(ua)) {
      return new NextResponse(null, {
        status: 403,
        headers: PRIVATE_HEADERS,
      });
    }
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────
  const hasSession = Boolean(req.auth);

  if (!hasSession && isProtectedPath(pathname)) {
    if (isPrefetchRequest(req)) {
      return new NextResponse(null, { status: 204 });
    }

    const signInUrl = new URL("/auth/signin", getRequestOrigin(req));
    const next = getNextPath(pathname, search);

    signInUrl.searchParams.set("next", next);
    signInUrl.searchParams.set("callbackUrl", next);

    return NextResponse.redirect(signInUrl);
  }

  // ── Stamp no-index headers on all protected responses ────────────────────
  if (isProtectedPath(pathname)) {
    const res = NextResponse.next();
    Object.entries(PRIVATE_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|site.webmanifest|sw.js|.*\\..*).*)",
  ],
};
