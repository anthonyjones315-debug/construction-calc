import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { withSentryConfig } from "@sentry/nextjs";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Keep service worker off in dev to avoid Turbopack incompatibility warnings.
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [{ url: "/offline", revision: "offline-v3" }],
  // Exclude fonts from precache so they never cause bad-precaching-response 404s.
  exclude: [
    /\.woff2?$/i,
    /\.(eot|ttf|otf)$/i,
    /_next\/static\/media\//,
    ({ asset }: { asset: { name?: string } }) => {
      const name = asset?.name ?? "";
      return (
        /\.(woff2?|eot|ttf|otf)$/i.test(name) || name.includes("static/media/")
      );
    },
  ],
  // Final safety: strip any font/static-media entries that still made it into the manifest.
  manifestTransforms: [
    (manifestEntries) => {
      const manifest = manifestEntries.filter((entry) => {
        const url = typeof entry === "string" ? entry : entry.url;
        const isFontOrMedia =
          /\.(woff2?|eot|ttf|otf)$/i.test(url) ||
          /_next\/static\/media\//.test(url);
        return !isFontOrMedia;
      });
      return { manifest, warnings: [] };
    },
  ],
});

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  typedRoutes: true,
  // Use webpack for compatibility with Serwist and Sentry sourcemaps.
  // Turbopack disabled (defaults to webpack in Next.js 16 when not specified)
  // Enable client sourcemaps so Sentry uploads map correctly.
  productionBrowserSourceMaps: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      { protocol: "https", hostname: "www.googletagmanager.com" },
      { protocol: "https", hostname: "www.google-analytics.com" },
      { protocol: "https", hostname: "www.googlesyndication.com" },
      { protocol: "https", hostname: "googleads.g.doubleclick.net" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/field-notes", permanent: true },
      {
        source: "/blog/:path*",
        destination: "/field-notes/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    const scriptSrc = [
      "script-src",
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "'wasm-unsafe-eval'",
      "https://va.vercel-scripts.com",
      "https://cdn.vercel-insights.com",
      "https://browser.sentry-cdn.com",
      "https://js.sentry-cdn.com",
      "https://*.googletagmanager.com",
      "https://static.cloudflareinsights.com",
      "https://pagead2.googlesyndication.com",
      "https://adservice.google.com",
      "https://*.adtrafficquality.google",
      "https://*.google-analytics.com",
      // PostHog loader (served from us-assets.i.posthog.com via rewrites)
      "https://us-assets.i.posthog.com",
      // Crisp chat widget script
      "https://client.crisp.chat",
    ].join(" ");

    const connectSrc = [
      "connect-src",
      "'self'",
      "data:",
      "blob:",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://*.googletagmanager.com",
      "https://*.g.doubleclick.net",
      "https://*.pagead2.googlesyndication.com",
      "https://*.googlesyndication.com",
      "https://*.adtrafficquality.google",
      "https://ep1.adtrafficquality.google",
      "https://*.google.com",
      "https://*.sentry.io",
      "https://o4511044273766400.ingest.us.sentry.io",
      // PostHog API + assets (proxied via /ingest*)
      "https://us.i.posthog.com",
      "https://us-assets.i.posthog.com",
      "https://vitals.vercel-insights.com",
      "https://va.vercel-scripts.com",
      "https://*.supabase.co",
      // Crisp chat WebSocket / API
      "https://client.relay.crisp.chat",
      "https://client.crisp.chat",
      "wss://client.relay.crisp.chat",
      "wss://client.crisp.chat",
    ].join(" ");

    const ContentSecurityPolicy = [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its hydration scripts without a nonce setup.
      // Sentry, Vercel, Google Tag Manager, Cloudflare Insights, and ad scripts allow-listed.
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://client.crisp.chat",
      "font-src 'self' data: https://fonts.gstatic.com https://client.crisp.chat",
      "img-src 'self' data: blob: https://images.unsplash.com https://www.googletagmanager.com https://*.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://*.supabase.co https://*.googleusercontent.com https://lh3.googleusercontent.com http://googleusercontent.com https://*.adtrafficquality.google https://ep1.adtrafficquality.google https://client.crisp.chat https://proconstructioncalc.com",
      // Sentry ingest + Vercel + Google Analytics + ads + Supabase Auth (required for password reset / auth recovery)
      connectSrc,
      "media-src 'none'",
      "object-src 'none'",
      "worker-src 'self' blob:",
      "frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.google.com https://*.adtrafficquality.google",
      // frame-ancestors mirrors X-Frame-Options: DENY for CSP-aware browsers
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const securityHeaders = [
      // ── Signals canonical protocol to Cloudflare and reverse proxies ─
      // Next.js and NextAuth read this to ensure cookies are flagged Secure.
      { key: "X-Forwarded-Proto", value: "https" },
      // ── Clickjacking protection ─────────────────────────────────
      { key: "X-Frame-Options", value: "DENY" },
      // ── MIME-type sniffing protection ───────────────────────────
      { key: "X-Content-Type-Options", value: "nosniff" },
      // ── Referrer stripped on HTTPS→HTTP downgrades; origin-only cross-origin ─
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // ── HSTS — Cloudflare enforces TLS at edge; this header tells
      //    browsers to also refuse plain-HTTP connections directly.
      //    max-age=2yr + includeSubDomains + preload for HSTS preload list.
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      // ── Cross-origin isolation / opener policy (improves security & some perf APIs) ─
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      // ── Content Security Policy ─────────────────────────────────
      { key: "Content-Security-Policy", value: ContentSecurityPolicy },
      // ── Permissions Policy — disable unused browser features ─────
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      // ── Next.js RSC / router CORS headers ───────────────────────
      {
        key: "Access-Control-Allow-Headers",
        value:
          "RSC, Next-Router-Prefetch, Next-Router-State-Tree, Content-Type, Authorization",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const configWithSerwist = withSerwist(nextConfig);

export default withSentryConfig(configWithSerwist, {
  org: process.env.SENTRY_ORG ?? "anthony-jones",
  project: process.env.SENTRY_PROJECT ?? "javascript-nextjs",
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  webpack: {
    autoInstrumentServerFunctions: true,
    autoInstrumentMiddleware: true,
    autoInstrumentAppDirectory: true,
    treeshake: { removeDebugLogging: true },
  },
});
