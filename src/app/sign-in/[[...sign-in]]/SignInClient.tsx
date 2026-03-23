"use client";

import { useSearchParams } from "next/navigation";
import { ClerkAuthLauncher } from "@/components/auth/ClerkAuthLauncher";
import { routes } from "@routes";
import { safeAppRedirectPath } from "@/lib/auth/safe-redirect";

export function SignInClient() {
  const searchParams = useSearchParams();
  const next =
    searchParams.get("callbackUrl") ??
    searchParams.get("redirect_url") ??
    searchParams.get("next");
  const fallback = safeAppRedirectPath(next, routes.commandCenter);

  return <ClerkAuthLauncher mode="sign-in" fallbackRedirectUrl={fallback} />;
}
