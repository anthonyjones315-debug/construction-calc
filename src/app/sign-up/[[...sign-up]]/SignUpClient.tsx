"use client";

import { useSearchParams } from "next/navigation";
import { ClerkAuthLauncher } from "@/components/auth/ClerkAuthLauncher";
import { routes } from "@routes";
import { safeAppRedirectPath } from "@/lib/auth/safe-redirect";

/**
 * New accounts default to Business Profile setup after sign-up.
 * Explicit `callbackUrl` / `redirect_url` / `next` still wins when safe.
 */
export function SignUpClient() {
  const searchParams = useSearchParams();
  const next =
    searchParams.get("callbackUrl") ??
    searchParams.get("redirect_url") ??
    searchParams.get("next");
  const fallback = safeAppRedirectPath(next, routes.settingsBusinessProfile);

  return <ClerkAuthLauncher mode="sign-up" fallbackRedirectUrl={fallback} />;
}
