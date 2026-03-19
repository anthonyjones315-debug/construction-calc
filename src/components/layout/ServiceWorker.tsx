"use client";

import { useEffect } from "react";
import { routes } from "@routes";

/**
 * Registers the app service worker so installed users keep a reliable field
 * workflow when signal drops on-site.
 */
export function ServiceWorker() {
  useEffect(() => {
    const enableInDev = process.env.NEXT_PUBLIC_ENABLE_SW_DEV === "true";
    const shouldRegister = process.env.NODE_ENV === "production" || enableInDev;

    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !shouldRegister
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
