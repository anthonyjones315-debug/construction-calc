const SERVICE_WORKER_SOURCE = `const CACHE_NAME = "pro-construction-calc-v4";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/",
  "/calculators",
  "/guide",
  "/app.webmanifest",
  "/icon",
  "/icon-512",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const sameOrigin = requestUrl.origin === self.location.origin;
  const isNavigation = event.request.mode === "navigate";

  // Bypass Service Worker completely for Next.js internal requests, API routes, and auth pages.
  // This prevents issues with Clerk middleware throwing during SW fetch intercepts.
  if (
    sameOrigin &&
    (requestUrl.pathname.startsWith("/_next/") ||
      requestUrl.pathname.startsWith("/api/") ||
      requestUrl.pathname.startsWith("/sign-in") ||
      requestUrl.pathname.startsWith("/sign-up") ||
      requestUrl.searchParams.has("_rsc"))
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          sameOrigin &&
          response.ok &&
          !isNavigation &&
          !requestUrl.pathname.startsWith("/api/")
        ) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }

        return response;
      })
      .catch(async () => {
        if (isNavigation) {
          return (
            (await caches.match(event.request)) ||
            (await caches.match(OFFLINE_URL)) ||
            new Response("", { status: 504, statusText: "Offline" })
          );
        }

        const cached = await caches.match(event.request);
        if (cached) return cached;

        return new Response("", {
          status: 504,
          statusText: "Offline",
        });
      }),
  );
});
`;

export function GET() {
  return new Response(SERVICE_WORKER_SOURCE, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
