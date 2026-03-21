import { routes } from "@routes";

/**
 * Restricts open redirects after Clerk sign-in/up to same-app paths.
 * Allows query strings; rejects protocol-relative and absolute URLs.
 */
export function safeAppRedirectPath(
  raw: string | null | undefined,
  fallback: string = routes.commandCenter,
): string {
  if (!raw || typeof raw !== "string") return fallback;

  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;

  // Block scheme hijacks and backslashes
  if (t.includes("://") || t.includes("\\")) return fallback;

  return t;
}
