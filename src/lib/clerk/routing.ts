import type { Route } from "next";
import { routes } from "@routes";
import { safeAppRedirectPath } from "@/lib/auth/safe-redirect";

export type ClerkAuthMode = "sign-in" | "sign-up";

function getEnvValue(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();

    if (value) {
      return value;
    }
  }

  return undefined;
}

export function getClerkAuthRoute(mode: ClerkAuthMode): Route {
  return mode === "sign-in" ? routes.auth.signIn : routes.auth.signUp;
}

export function getDefaultClerkRedirect(mode: ClerkAuthMode): string {
  return mode === "sign-in"
    ? routes.commandCenter
    : routes.settingsBusinessProfile;
}

export function getSafeClerkRedirect(
  mode: ClerkAuthMode,
  candidate: string | null | undefined,
): string {
  return safeAppRedirectPath(candidate, getDefaultClerkRedirect(mode));
}

export function buildClerkAuthHref(
  mode: ClerkAuthMode,
  redirectTo?: string | null,
): Route {
  const route = getClerkAuthRoute(mode);
  const safeRedirect = getSafeClerkRedirect(mode, redirectTo);

  if (safeRedirect === getDefaultClerkRedirect(mode)) {
    return route;
  }

  return `${route}?callbackUrl=${encodeURIComponent(safeRedirect)}` as Route;
}

export function getClerkRouteFromEnv(mode: ClerkAuthMode): string {
  const candidate =
    mode === "sign-in"
      ? getEnvValue("NEXT_PUBLIC_CLERK_SIGN_IN_URL")
      : getEnvValue("NEXT_PUBLIC_CLERK_SIGN_UP_URL");

  return safeAppRedirectPath(candidate, getClerkAuthRoute(mode));
}

export function getClerkFallbackRedirectFromEnv(mode: ClerkAuthMode): string {
  const candidate =
    mode === "sign-in"
      ? getEnvValue(
          "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
          "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
        )
      : getEnvValue(
          "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
          "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
        );

  return getSafeClerkRedirect(mode, candidate);
}
