"use client";

import { useSearchParams } from "next/navigation";
import { ClerkAuthPage } from "@/components/auth/ClerkAuthPage";
import { getSafeClerkRedirect } from "@/lib/clerk/routing";

export function SignInClient({ clerkEnabled }: { clerkEnabled: boolean }) {
  const searchParams = useSearchParams();
  const next =
    searchParams.get("callbackUrl") ??
    searchParams.get("redirect_url") ??
    searchParams.get("next");
  const fallback = getSafeClerkRedirect("sign-in", next);

  return (
    <ClerkAuthPage
      mode="sign-in"
      fallbackRedirectUrl={fallback}
      clerkEnabled={clerkEnabled}
    />
  );
}
