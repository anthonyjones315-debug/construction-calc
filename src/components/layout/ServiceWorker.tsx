"use client";

import { useEffect } from "react";

/**
 * Registers the static service worker at /sw.js (file lives in public/sw.js).
 * Do not use /public/sw.js — Next/Vercel serve public assets at the root.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      fetch("/sw.js", { method: "HEAD" })
        .then((res) => {
          if (!res.ok) {
            console.info("Service Worker skipped: /sw.js missing (status " + res.status + ")");
            return;
          }
          return navigator.serviceWorker.register("/sw.js").then(() => {
            console.log("Service Worker registered: /sw.js");
          });
        })
        .catch((err) => {
          console.info("Service Worker registration skipped:", err);
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
