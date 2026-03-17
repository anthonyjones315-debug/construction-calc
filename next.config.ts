import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  typedRoutes: true,
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
      "https://vercel.live",
      "https://browser.sentry-cdn.com",
      "https://js.sentry-cdn.com",
      "https://*.googletagmanager.com",
      "https://static.cloudflareinsights.com",
      "https://pagead2.googlesyndication.com",
      "https://adservice.google.com",
      "https://*.adtrafficquality.google",
      "https://*.google-analytics.com",
      // Google Identity / OAuth (defensive allow-listing)
      "https://accounts.google.com",
      // PostHog loader (served from us-assets.i.posthog.com via rewrites)
      "https://us-assets.i.posthog.com",
      // Termly CMP loader
      "https://app.termly.io",
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
      // Google Identity / OAuth + APIs used during login
      "https://accounts.google.com",
      "https://oauth2.googleapis.com",
      "https://www.googleapis.com",
      "https://*.sentry.io",
      "https://o4511044273766400.ingest.us.sentry.io",
      // PostHog API + assets (proxied via /ingest*)
      "https://us.i.posthog.com",
      "https://us-assets.i.posthog.com",
      "https://vitals.vercel-insights.com",
      "https://va.vercel-scripts.com",
      "https://vercel.live",
      "https://app.termly.io",
      "https://us.consent.api.termly.io",
      "https://proconstructioncalc.com",
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
      "img-src 'self' data: blob: https://images.unsplash.com https://www.googletagmanager.com https://*.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://*.supabase.co https://*.googleusercontent.com https://lh3.googleusercontent.com http://googleusercontent.com https://*.adtrafficquality.google https://ep1.adtrafficquality.google https://client.crisp.chat https://image.crisp.chat https://proconstructioncalc.com https://app.termly.io",
      // Sentry ingest + Vercel + Google Analytics + ads + Supabase Auth (required for password reset / auth recovery)
      connectSrc,
      "media-src 'none'",
      "object-src 'none'",
      "worker-src 'self' blob:",
      "frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.google.com https://accounts.google.com https://*.adtrafficquality.google",
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

export default withSentryConfig(nextConfig, {
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
