import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { OptionalTracking } from "@/components/layout/OptionalTracking";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
    default: "Build Calc Pro — Free Construction Calculators",
    template: "%s | Build Calc Pro",
  },
  description:
    "Free construction calculators for concrete, framing, roofing, insulation, flooring, electrical and more. Built for contractors and DIYers.",
  keywords: [
    "construction calculator",
    "concrete calculator",
    "framing calculator",
    "roofing calculator",
    "insulation calculator",
  ],
  authors: [{ name: "Build Calc Pro" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://proconstructioncalc.com",
    siteName: "Build Calc Pro",
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
        className={`${inter.variable} ${barlowCondensed.variable} ${jetBrainsMono.variable}`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <ScrollToTop />
          {children}
        </Providers>
        <CookieConsentBanner />
        <ServiceWorker />
        <OptionalTracking />
      </body>
    </html>
  );
}
