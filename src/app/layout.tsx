import type { Metadata, Viewport } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { OptionalTracking } from "@/components/layout/OptionalTracking";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PWAInstallBanner } from "@/components/layout/PWAInstallBanner";
import { Providers } from "@app/providers";

// Prevents accidental zoom-on-input-focus on iOS and Android.
// maximum-scale=1 / user-scalable=no keeps the field UI locked at 1×.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
    <html lang="en" className="bg-slate-950 text-slate-100">
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
          <Providers>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            {children}
          </Providers>
        </Suspense>
        <CookieConsentBanner />
        <ServiceWorker />
        <OptionalTracking />
        <PWAInstallBanner />
        <a
          href="/contact"
          className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full border border-orange-500 bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-orange-700"
          aria-label="Send feedback"
        >
          Feedback
        </a>
      </body>
    </html>
  );
}
