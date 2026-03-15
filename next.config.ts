import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { withSentryConfig } from "@sentry/nextjs";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/offline", revision: "offline-v3" }], // Bump to v3
  // AGGRESSIVE OVERHAUL:
  // We use a function for 'exclude' to force-kill any font path
  exclude: [
    ({ asset }: { asset: any }) => {
      if (
        asset.name.match(/\.(woff2?|eot|ttf|otf)$/) ||
        asset.name.includes("static/media/")
      ) {
        return true; // true means EXCLUDE it
      }
      return false;
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
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Headers",
            value:
              "RSC, Next-Router-Prefetch, Next-Router-State-Tree, Content-Type, Authorization",
          },
        ],
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
