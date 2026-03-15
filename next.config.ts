import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { withSentryConfig } from "@sentry/nextjs";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
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
  turbopack: {},
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
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
    const ContentSecurityPolicy = [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its hydration scripts without a nonce setup.
      // Sentry and Vercel analytics scripts are explicitly allow-listed by origin.
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://cdn.vercel-insights.com https://browser.sentry-cdn.com https://js.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com",
      // Sentry ingestion + Vercel Web Analytics + Speed Insights
      "connect-src 'self' https://*.sentry.io https://o*.ingest.sentry.io https://vitals.vercel-insights.com https://va.vercel-scripts.com",
      "media-src 'none'",
      "object-src 'none'",
      "frame-src 'none'",
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
