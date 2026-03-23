// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect specific routes (adjust as needed)
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/forum(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (session && typeof (session as any).protect === "function") {
      await (session as any).protect();
    }
  }
});
