import type { Metadata, Viewport } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { OptionalTracking } from "@/components/layout/OptionalTracking";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PWAInstallBanner } from "@/components/layout/PWAInstallBanner";
import { CrispChat } from "@/components/support/CrispChat";
import { CSPostHogProvider } from "@/components/providers/PostHogProvider";
import { PostHogPageView } from "@/components/providers/PostHogPageView";
import { Providers } from "@app/providers";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://proconstructioncalc.com"),
  title: {
    default:
      "Pro Construction Calc — Construction Estimating & Cost Calculators",
    template: "%s | Pro Construction Calc",
  },
  description:
    "Professional construction estimating calculators for contractors, including trade-specific quantity math, cost planning, and client-ready estimate exports. Built for Rome, NY and Central New York.",
  keywords: [
    "construction calculator",
    "concrete calculator",
    "framing calculator",
    "roofing calculator",
    "insulation calculator",
    "Rome NY",
    "Central New York",
    "contractor estimating",
  ],
  authors: [{ name: "Pro Construction Calc", url: "https://proconstructioncalc.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://proconstructioncalc.com",
    siteName: "Pro Construction Calc",
    title: "Pro Construction Calc — Construction Estimating & Cost Calculators",
    description:
      "Professional construction estimating calculators for contractors. Trade-specific math, cost planning, and client-ready exports for Central NY.",
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
    title: "Pro Construction Calc — Construction Estimating & Cost Calculators",
    description:
      "Professional construction estimating calculators for contractors. Built for Central New York.",
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
  return (
    <html lang="en" className="bg-slate-950 text-slate-200 overflow-x-hidden">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
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
        className={`command-theme ${inter.variable} ${oswald.variable} ${jetBrainsMono.variable}`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <CSPostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <Providers>
              <Suspense fallback={null}>
                <ScrollToTop />
              </Suspense>
              {children}
            </Providers>
          </CSPostHogProvider>
        </Suspense>
        <CookieConsentBanner />
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
