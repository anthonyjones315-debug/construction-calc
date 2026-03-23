"use client";

import { useSearchParams } from "next/navigation";
import { ClerkAuthPage } from "@/components/auth/ClerkAuthPage";
import { getSafeClerkRedirect } from "@/lib/clerk/routing";

/**
 * New accounts default to Business Profile setup after sign-up.
 * Explicit `callbackUrl` / `redirect_url` / `next` still wins when safe.
 */
export function SignUpClient({ clerkEnabled }: { clerkEnabled: boolean }) {
  const searchParams = useSearchParams();
  const next =
    searchParams.get("callbackUrl") ??
    searchParams.get("redirect_url") ??
    searchParams.get("next");
  const fallback = getSafeClerkRedirect("sign-up", next);

  return (
    <ClerkAuthPage
      mode="sign-up"
      fallbackRedirectUrl={fallback}
      clerkEnabled={clerkEnabled}
    />
  );
}
