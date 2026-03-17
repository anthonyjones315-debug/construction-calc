"use client";

import { useEffect } from "react";
import { routes } from "@routes";

/**
 * Registers the app service worker so installed users keep a reliable field
 * workflow when signal drops on-site.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register(routes.api.serviceWorker)
      .then((registration) => {
        registration.update().catch(() => {});
      })
      .catch(() => {});
  }, []);

  return null;
}
