import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typescript: { ignoreBuildErrors: true },
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
      { source: "/register", destination: "/sign-up", permanent: true },
      { source: "/forgot-password", destination: "/sign-in", permanent: true },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.proconstructioncalc.com',
          },
        ],
        destination: 'https://proconstructioncalc.com/:path*',
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
      "https://maps.googleapis.com",
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
      // AudioEye accessibility
      "https://*.audioeye-services.com",
      "https://*.audioeye.com",
      // Clerk (auth UI + bot challenge)
      "https://*.clerk.accounts.dev",
      "https://clerk.accounts.dev",
      "https://*.clerk.com",
      "https://clerk.com",
      "https://challenges.cloudflare.com",
      "https://*.proconstructioncalc.com",
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
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
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
      // Google user avatar images (service worker fetch)
      "https://lh3.googleusercontent.com",
      // Crisp chat WebSocket / API
      "https://client.relay.crisp.chat",
      "https://client.crisp.chat",
      "wss://client.relay.crisp.chat",
      "wss://client.crisp.chat",
      // AudioEye API
      "https://*.audioeye.com",
      "https://*.audioeye-services.com",
      // Clerk API + telemetry (keyless uses *.clerk.accounts.dev)
      "https://*.clerk.accounts.dev",
      "https://clerk.accounts.dev",
      "https://clerk.com",
      "https://*.clerk.com",
      "https://clerk-telemetry.com",
      "https://*.clerk-telemetry.com",
      // Cloudflare Insights
      "https://static.cloudflareinsights.com",
      "https://cloudflareinsights.com",
      "https://*.proconstructioncalc.com",
    ].join(" ");

    const ContentSecurityPolicy = [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its hydration scripts without a nonce setup.
      // Sentry, Vercel, Google Tag Manager, Cloudflare Insights, and ad scripts allow-listed.
      scriptSrc,
      "style-src 'self' 'unsafe-inline' data: https://fonts.googleapis.com https://client.crisp.chat https://*.audioeye-services.com",
      "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://client.crisp.chat",
      "img-src 'self' data: blob: https://images.unsplash.com https://maps.gstatic.com https://maps.googleapis.com https://www.googletagmanager.com https://*.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://*.supabase.co https://*.googleusercontent.com https://lh3.googleusercontent.com http://googleusercontent.com https://*.adtrafficquality.google https://ep1.adtrafficquality.google https://client.crisp.chat https://image.crisp.chat https://proconstructioncalc.com https://app.termly.io https://img.clerk.com https://*.clerk.com https://cdn.clerk.com",
      // Sentry ingest + Vercel + Google Analytics + ads + Supabase Auth (required for password reset / auth recovery)
      connectSrc,
      "media-src 'none'",
      "object-src 'none'",
      "worker-src 'self' blob:",
      "frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.google.com https://accounts.google.com https://*.adtrafficquality.google https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.accounts.dev https://clerk.com https://*.clerk.com https://cdn.clerk.com https://*.proconstructioncalc.com https://vercel.live",
      // frame-ancestors mirrors X-Frame-Options: DENY for CSP-aware browsers
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const securityHeaders = [
      // ── Clickjacking protection ─────────────────────────────────
      { key: "X-Frame-Options", value: "DENY" },
      // ── MIME-type sniffing protection ───────────────────────────
      { key: "X-Content-Type-Options", value: "nosniff" },
      // ── Referrer stripped on HTTPS→HTTP downgrades; origin-only cross-origin ─
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
        value: "camera=(), microphone=(), interest-cohort=(), geolocation=(self \"https://maps.googleapis.com\")",
      },
      // ── Next.js RSC / router CORS headers ───────────────────────
      {
        key: "Access-Control-Allow-Headers",
        value:
          "RSC, Next-Router-Prefetch, Next-Router-State-Tree, Next-Router-Segment-Prefetch, next-router-segment-prefetch, Next-Url, next-url, Content-Type, Authorization",
      },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
      securityHeaders.push({
        key: "X-Forwarded-Proto",
        value: "https",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/__clerk/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://proconstructioncalc.com" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS, PATCH, DELETE, POST, PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
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
