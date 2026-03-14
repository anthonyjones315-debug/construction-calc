import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED = ["/saved", "/pricebook", "/settings"];
const CANONICAL_HOST = "proconstructioncalc.com";
const LEGACY_HOSTS = new Set(["www.proconstructioncalc.com"]);

function getRelativeCallbackUrl(pathname: string, search: string): string {
  return `${pathname}${search}` || "/";
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const host = req.nextUrl.hostname.toLowerCase();

  if (LEGACY_HOSTS.has(host)) {
    return NextResponse.redirect(
      `https://${CANONICAL_HOST}${pathname}${search}`,
      308,
    );
  }

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !req.auth) {
    const signIn = req.nextUrl.clone();
    signIn.pathname = "/auth/signin";
    signIn.search = "";
    signIn.searchParams.set(
      "callbackUrl",
      getRelativeCallbackUrl(pathname, search),
    );
    return NextResponse.redirect(signIn);
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|sw.js|.*\\..*).*)",
  ],
};
