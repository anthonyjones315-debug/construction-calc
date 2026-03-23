import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { shouldUseClerkMiddleware } from "@/lib/clerk/env";

const clerkReady = shouldUseClerkMiddleware();

export default clerkReady
  ? clerkMiddleware()
  : async function clerkDisabledProxy() {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[Clerk] API keys missing or invalid. Either:\n" +
            "  • Set both NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (pk_test_… or pk_live_…) and CLERK_SECRET_KEY (sk_test_… or sk_live_…) from https://dashboard.clerk.com/last-active?path=api-keys\n" +
            "  • Or remove both variables for keyless dev mode.\n" +
            "Docs: src/lib/supabase/CLERK_SETUP.md — Middleware is passthrough until fixed (auth will not work).",
        );
      }
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
