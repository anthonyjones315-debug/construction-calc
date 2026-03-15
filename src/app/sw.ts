import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import { NetworkFirst, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// --- 1. THE "INDUSTRIAL" FILTER ---
// Intercept the manifest from Next.js and strip out any static media or fonts
// that cause the "bad-precaching-response" 404 crashes.
const rawManifest = self.__SW_MANIFEST || [];
const cleanManifest = rawManifest.filter((entry) => {
  const url = typeof entry === "string" ? entry : entry.url;

  // If the URL contains an image/font extension OR is in the static/media folder, KILL IT.
  const isBadAsset =
    url.match(/\.(?:woff2?|eot|ttf|otf|png|jpg|jpeg|svg|gif|webp)$/i) ||
    url.includes("_next/static/media/");

  return !isBadAsset; // Only return true (keep) if it's NOT a bad asset
});

// --- 2. INITIALIZE SERWIST ---
const serwist = new Serwist({
  precacheEntries: cleanManifest, // Pass the scrubbed list here
  cacheId: "precache-v3",
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && url.pathname.startsWith("/calculators"),
      handler: new NetworkFirst({
        cacheName: "calculators-pages",
        networkTimeoutSeconds: 10,
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
