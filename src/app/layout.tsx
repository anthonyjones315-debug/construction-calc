import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/layout/Analytics";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-barlow-condensed",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-jetbrains-mono",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${inter.className} ${inter.variable} ${barlowCondensed.variable} ${jetBrainsMono.variable}`}
      >
        <ScrollToTop />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Analytics />
      </body>
    </html>
  );
}
