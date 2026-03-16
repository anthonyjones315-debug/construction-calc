"use client";
import { useEffect } from "react";

export function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Only register if the service worker file exists (avoid 404 noise).
      fetch("/public/sw.js", { method: "HEAD" })
        .then((res) => {
          if (!res.ok) return;
          navigator.serviceWorker.register("/public/sw.js").catch(() => {
            // SW registration failed — app still works, just without offline support
          });
        })
        .catch(() => {
          // Ignore missing SW in environments where it's not built
        });
    }
  }, []);
  return null;
}
