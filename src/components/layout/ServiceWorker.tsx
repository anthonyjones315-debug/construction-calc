"use client";

import { useEffect } from "react";

/**
 * Registers the static service worker at /sw.js (file lives in public/sw.js).
 * Do not use /public/sw.js — Next/Vercel serve public assets at the root.
 */
export function ServiceWorker() {
  useEffect(() => {
    // Temporarily disable service worker registration to avoid 404 noise.
    return;
  }, []);

  return null;
}
