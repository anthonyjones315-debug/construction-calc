import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { getClerkPublishableKey } from "@/lib/clerk/publishable-key";
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
import { WebVitals } from "@/components/providers/WebVitals";
import { Providers } from "@app/providers";
import TermlyCMP from "@/components/TermlyCMP";
import { AuthGuard } from "@/app/components/AuthGuard";
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

function getOrigin(url: string | undefined): string | null {
  if (!url) return null;

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

const supabaseOrigin = getOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const resendOrigin = "https://api.resend.com";

/** Google AdSense (Auto Ads) — load when NEXT_PUBLIC_ADSENSE_ID is set */
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_ID?.trim();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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

const clerkPublishableKey = getClerkPublishableKey();

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_SITE_URL),
  title: brandedSiteTitle,
  description:
    "Professional construction estimating calculators for contractors nationwide, offering trade-specific quantity math, cost planning, and client-ready estimate exports.",
  keywords: [
    "construction calculator",
    "concrete calculator",
    "framing calculator",
    "roofing calculator",
    "insulation calculator",
    "construction cost estimation",
    "contractor estimating tools",
    "building material calculator",
    "nationwide construction calculator",
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
    <html lang="en" className="command-theme light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {SHOULD_LINK_MANIFEST ? (
          <link rel="manifest" href="/app.webmanifest" />
        ) : null}
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
        <link rel="preconnect" href={resendOrigin} crossOrigin="" />
        <link rel="dns-prefetch" href={resendOrigin} />
        {ADSENSE_CLIENT_ID ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT_ID)}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Pro Calc" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
        {/*
          Critical CSS vars injected inline so Slate & Blue theme colors
          are available before the external stylesheet or any font loads.
          This prevents a flash of white/unstyled background on first paint.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-bg: #f6f4ef;
                --color-surface: #ffffff;
                --color-surface-alt: #fafaf8;
                --color-ink: #0f1117;
                --color-ink-mid: #334155;
                --color-ink-dim: #64748b;
                --color-border: #e2e0db;
                --color-primary: #2563eb;
                --color-primary-rgb: 37 99 235;
                --color-blue-brand: #2563eb;
                --color-blue-dark: #1d4ed8;
                --color-nav-bg: rgba(255, 255, 255, 0.94);
                --shell-header-h: 52px;
              }
              html { background: var(--color-bg); color: var(--color-ink); }
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
        {/* ClerkProvider reads request auth (cookies/headers); Next.js 16 requires Suspense */}
        <Suspense fallback={null}>
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: "#2563eb",
                colorText: "#111827",
                colorTextSecondary: "#64748b",
              },
              layout: {
                logoImageUrl: "/images/app-logo-transparent.png",
              },
              elements: {
                card: "rounded-2xl border border-[--color-border] shadow-xl",
                formButtonPrimary: "rounded-xl font-bold uppercase tracking-[0.08em]",
              }
            }}
            {...(clerkPublishableKey
              ? { publishableKey: clerkPublishableKey }
              : {})}
          >
            <Suspense fallback={null}>
              <CSPostHogProvider>
                <Suspense fallback={null}>
                  <PostHogPageView />
                </Suspense>
                {verifiedReviewSchema ? (
                  <>
                    <JsonLD schema={localBusinessSchema} />
                    <JsonLD schema={verifiedReviewSchema} />
                  </>
                ) : null}
                <Providers>
                  <Suspense fallback={null}>
                    <ScrollToTop />
                  </Suspense>
                  {/* Only render TermlyCMP if not on sign-in page */}
                  {TERMELY_WEBSITE_UUID &&
                    typeof window !== "undefined" &&
                    !window.location.pathname.startsWith("/sign-in") && (
                      <TermlyCMP
                        websiteUUID={TERMELY_WEBSITE_UUID}
                        autoBlock={TERMELY_AUTO_BLOCK}
                        masterConsentsOrigin={TERMELY_MASTER_CONSENTS_ORIGIN}
                      />
                    )}
                  <WebVitals />
                    <AuthGuard>{children}</AuthGuard>
                </Providers>
              </CSPostHogProvider>
            </Suspense>
            <ServiceWorker />
            <OptionalTracking />
            <PWAInstallBanner />
            <Suspense fallback={null}>
              <CrispChat />
            </Suspense>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
