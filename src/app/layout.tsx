import type { Metadata, Viewport } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { OptionalTracking } from "@/components/layout/OptionalTracking";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PWAInstallBanner } from "@/components/layout/PWAInstallBanner";
import { CrispChat } from "@/components/support/CrispChat";
import { CSPostHogProvider } from "@/components/providers/PostHogProvider";
import { PostHogPageView } from "@/components/providers/PostHogPageView";
import { Providers } from "@app/providers";
import TermlyCMP from "@/components/TermlyCMP";
import { JsonLD, getLocalBusinessSchema, getVerifiedReviewSchema } from "@/seo";
import {
  BUSINESS_NAME,
  BUSINESS_REGION,
  BUSINESS_SITE_URL,
} from "@/lib/business-identity";

const TERMELY_WEBSITE_UUID =
  process.env.NEXT_PUBLIC_TERMELY_WEBSITE_UUID ??
  process.env.TERMELY_WEBSITE_UUID ??
  "294204b1-a0a3-4f09-925a-30dfd75d3914";
const TERMELY_MASTER_CONSENTS_ORIGIN =
  process.env.NEXT_PUBLIC_TERMELY_MASTER_ORIGIN ??
  process.env.TERMELY_MASTER_ORIGIN;
const TERMELY_AUTO_BLOCK =
  process.env.NEXT_PUBLIC_TERMELY_AUTO_BLOCK === "true" ||
  process.env.TERMELY_AUTO_BLOCK === "true";
const SHOULD_LINK_MANIFEST =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV !== "production";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow users to zoom for accessibility instead of locking scale.
  maximumScale: 5,
  userScalable: true,
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});

const brandedSiteTitle = `${BUSINESS_NAME} — Construction Estimating & Cost Calculators`;

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_SITE_URL),
  title: brandedSiteTitle,
  description:
    "Professional construction estimating calculators for contractors across Oneida, Madison, and Herkimer counties, including trade-specific quantity math, cost planning, and client-ready estimate exports.",
  keywords: [
    "construction calculator",
    "concrete calculator",
    "framing calculator",
    "roofing calculator",
    "insulation calculator",
    "Oneida County NY",
    "Madison County NY",
    "Herkimer County NY",
    "Tri-County New York",
    "Central New York",
    "contractor estimating",
  ],
  authors: [{ name: BUSINESS_NAME, url: BUSINESS_SITE_URL }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BUSINESS_SITE_URL,
    siteName: BUSINESS_NAME,
    title: brandedSiteTitle,
    description: `Professional construction estimating calculators for contractors across ${BUSINESS_REGION}.`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pro Construction Calc — Construction Estimating Calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: brandedSiteTitle,
    description: `Professional construction estimating calculators for contractors across ${BUSINESS_REGION}.`,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "nAsuG6MnX4DrPVKMH2QOZZ9xaMxD6cah0oGH9duNjdU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessSchema = getLocalBusinessSchema();
  const verifiedReviewSchema = getVerifiedReviewSchema();

  return (
    <html lang="en" className="bg-slate-950 text-slate-200">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {SHOULD_LINK_MANIFEST ? (
          <link rel="manifest" href="/app.webmanifest" />
        ) : null}
        {/*
          Critical CSS vars injected inline so Slate & Orange theme colors
          are available before the external stylesheet or any font loads.
          This prevents a flash of white/unstyled background on first paint.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-bg: #020617;
                --color-surface: #1e293b;
                --color-surface-alt: #111827;
                --color-ink: #f8fafc;
                --color-ink-mid: #cbd5f5;
                --color-ink-dim: #94a3b8;
                --color-border: #1f2937;
                --color-orange-brand: #f7941d;
                --color-orange-dark: #d06a18;
                --color-nav-bg: #0a0f1a;
              }
              html { background: #020617; color: #f8fafc; }
            `,
          }}
        />
      </head>
      <body
        className={`command-theme ${inter.variable} ${oswald.variable} ${jetBrainsMono.variable} min-h-dvh flex flex-col`}
      >
        <a href="#main-content" className="skip-link" tabIndex={0}>
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <CSPostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <JsonLD schema={localBusinessSchema} />
            {verifiedReviewSchema ? (
              <JsonLD schema={verifiedReviewSchema} />
            ) : null}
            <Providers>
              <Suspense fallback={null}>
                <ScrollToTop />
              </Suspense>
              {TERMELY_WEBSITE_UUID && (
                <TermlyCMP
                  websiteUUID={TERMELY_WEBSITE_UUID}
                  autoBlock={TERMELY_AUTO_BLOCK}
                  masterConsentsOrigin={TERMELY_MASTER_CONSENTS_ORIGIN}
                />
              )}
              {children}
            </Providers>
          </CSPostHogProvider>
        </Suspense>
        <ServiceWorker />
        <OptionalTracking />
        <PWAInstallBanner />
        <Suspense fallback={null}>
          <CrispChat />
        </Suspense>
      </body>
    </html>
  );
}
