"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname || !posthog) return;
    // Keep the public homepage out of PostHog so analytics stay focused on
    // in-app contractor workflows rather than the privacy-sensitive landing splash.
    if (pathname === "/") return;

    let url = window.origin + pathname;
    const search = searchParams.toString();

    if (search) {
      url = `${url}?${search}`;
    }

    posthog.capture("$pageview", {
      $current_url: url,
    });
  }, [pathname, searchParams, posthog]);

  return null;
}
