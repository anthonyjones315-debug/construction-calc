import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { shouldUseClerkMiddleware } from "@/lib/clerk/env";

const isProtectedPageRoute = createRouteMatcher([
  "/saved(.*)",
  "/pricebook(.*)",
  "/settings(.*)",
  "/command-center(.*)",
  "/crm(.*)",
  "/onboarding(.*)",
]);

const isProtectedApiRoute = createRouteMatcher([
  "/api/auth/session(.*)",
  "/api/auth/delete-account(.*)",
  "/api/business-profile(.*)",
  "/api/command-center(.*)",
  "/api/contractor-profile(.*)",
  "/api/estimates(.*)",
  "/api/generate-pdf(.*)",
  "/api/health/db(.*)",
  "/api/materials(.*)",
  "/api/prices/update(.*)",
  "/api/send(.*)",
  "/api/user-preferences(.*)",
]);

const clerkProxy = clerkMiddleware(
  async (auth, req) => {
    if (isProtectedPageRoute(req) || isProtectedApiRoute(req)) {
      await auth.protect();
    }
  },
  {
    debug: process.env.NODE_ENV === "development",
  },
);

const passThroughProxy = () => NextResponse.next();

export default shouldUseClerkMiddleware() ? clerkProxy : passThroughProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
