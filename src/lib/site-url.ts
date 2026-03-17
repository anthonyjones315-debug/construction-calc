const DEFAULT_PUBLIC_SITE_URL = "https://proconstructioncalc.com";

export function getPublicSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window === "undefined"
      ? (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL)
      : undefined);

  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall through to the safer defaults below.
    }
  }

  if (
    typeof window !== "undefined" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(window.location.origin)
  ) {
    return window.location.origin;
  }

  return DEFAULT_PUBLIC_SITE_URL;
}

export function buildPublicUrl(path: string) {
  return new URL(path, getPublicSiteUrl()).toString();
}
