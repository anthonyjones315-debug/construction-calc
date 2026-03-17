"use client";

import { useEffect } from "react";

/**
 * Cleans up stale service worker registrations while /sw.js is served by the
 * app route handler at src/app/sw.js/route.ts.
 */
export function ServiceWorker() {
  useEffect(() => {
    // Temporarily disable service worker registration to avoid 404 noise.
    if (typeof navigator !== "undefined" && navigator.serviceWorker?.getRegistrations) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister().catch(() => {}));
      });
    }
  }, []);

  return null;
}
