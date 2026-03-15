import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { OptionalTracking } from "@/components/layout/OptionalTracking";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Providers } from "@app/providers";

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
    "Professional construction estimating calculators for contractors, including trade-specific quantity math, cost planning, and client-ready estimate exports.",
  keywords: [
    "construction calculator",
    "concrete calculator",
    "framing calculator",
    "roofing calculator",
    "insulation calculator",
  ],
  authors: [{ name: "Pro Construction Calc" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://proconstructioncalc.com",
    siteName: "Pro Construction Calc",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
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
        <a
          href="mailto:support@proconstructioncalc.com?subject=Feedback%20-%20Pro%20Construction%20Calc"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-orange-500 bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-orange-700"
          aria-label="Send feedback"
        >
          Feedback
        </a>
      </body>
    </html>
  );
}
