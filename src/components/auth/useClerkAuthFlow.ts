"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  buildClerkAuthHref,
  getSafeClerkRedirect,
  type ClerkAuthMode,
} from "@/lib/clerk/routing";

export function useClerkAuthFlow() {
  const clerk = useClerk();
  const { isLoaded } = useAuth();
  const router = useRouter();

  const navigateToAuthPage = useCallback(
    (mode: ClerkAuthMode, fallbackRedirectUrl?: string | null) => {
      router.push(buildClerkAuthHref(mode, fallbackRedirectUrl));
    },
    [router],
  );

  const openAuth = useCallback(
    async (mode: ClerkAuthMode, fallbackRedirectUrl?: string | null) => {
      const safeRedirect = getSafeClerkRedirect(mode, fallbackRedirectUrl);

      if (!isLoaded) {
        navigateToAuthPage(mode, safeRedirect);
        return false;
      }

      try {
        if (mode === "sign-up") {
          await clerk.openSignUp({ fallbackRedirectUrl: safeRedirect });
        } else {
          await clerk.openSignIn({ fallbackRedirectUrl: safeRedirect });
        }

        return true;
      } catch {
        navigateToAuthPage(mode, safeRedirect);
        return false;
      }
    },
    [clerk, isLoaded, navigateToAuthPage],
  );

  return {
    navigateToAuthPage,
    openAuth,
    openSignIn: (fallbackRedirectUrl?: string | null) =>
      openAuth("sign-in", fallbackRedirectUrl),
    openSignUp: (fallbackRedirectUrl?: string | null) =>
      openAuth("sign-up", fallbackRedirectUrl),
  };
}
