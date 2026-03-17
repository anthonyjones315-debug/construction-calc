import { auth } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "proconstructioncalc.com";
const LEGACY_HOSTS = new Set(["www.proconstructioncalc.com"]);
const PROTECTED_PATH_PREFIXES = [
  "/saved",
  "/pricebook",
  "/settings",
  "/command-center",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
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

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|site.webmanifest|sw.js|.*\\..*).*)",
  ],
};
