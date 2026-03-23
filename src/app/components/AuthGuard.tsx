"use client";

import { useSession } from "@/lib/auth/client";
import { AuthSplash } from "@/app/components/AuthSplash";
import { usePathname } from "next/navigation";
import { protectedRoutes } from "@routes";

const EXTRA_PROTECTED_PAGES = ["/crm", "/estimate"];

/**
 * Wraps protected parts of the app. If the user is not signed in and visits a protected route, show the splash.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname() || "";

  // Check if current path requires auth
  const isProtected = [...protectedRoutes, ...EXTRA_PROTECTED_PAGES].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If public route, always render
  if (!isProtected) {
    return <>{children}</>;
  }

  // While auth state is loading, avoid flicker.
  if (status === "loading") return null;

  return status === "authenticated" ? <>{children}</> : <AuthSplash />;
}
