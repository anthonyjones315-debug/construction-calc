import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import { NetworkFirst, NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

function shouldBypassExternalHost(hostname: string): boolean {
  // Ensure analytics/ads/telemetry and Supabase calls stay network-only.
  // This prevents accidental caching/precaching and avoids SW-related fetch noise.
  return (
    hostname.endsWith("google-analytics.com") ||
    hostname.endsWith("analytics.google.com") ||
    hostname.endsWith("googletagmanager.com") ||
    hostname.endsWith("g.doubleclick.net") ||
    hostname.endsWith("pagead2.googlesyndication.com") ||
    hostname.endsWith("google.com") ||
    hostname.endsWith("sentry.io") ||
    hostname.endsWith("supabase.co")
  );
}

const serwist = new Serwist({
  // INLINE FILTER: The bundler replaces self.__SW_MANIFEST right here,
  // and the filter immediately scrubs bad assets at runtime.
  precacheEntries: (self.__SW_MANIFEST || []).filter((entry) => {
    const url = typeof entry === "string" ? entry : entry.url;
    const isBadAsset =
      url.includes("_next/static/") ||
      url.endsWith(".map") ||
      url.match(/\.(woff2?|eot|ttf|otf)$/i);

    return !isBadAsset;
  }),
  cacheId: "precache-v5",
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // External telemetry/ads/auth providers: always go to network, never cache.
    {
      matcher: ({ url, sameOrigin }) =>
        !sameOrigin && shouldBypassExternalHost(url.hostname),
      handler: new NetworkOnly(),
    },
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
