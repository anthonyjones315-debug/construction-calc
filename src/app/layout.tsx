import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@/components/layout/Analytics'

export const metadata: Metadata = {
  metadataBase: new URL('https://proconstructioncalc.com'),
  title: {
    default: 'Build Calc Pro — Free Construction Calculators',
    template: '%s | Build Calc Pro',
  },
  description: 'Free construction calculators for concrete, framing, roofing, insulation, flooring, electrical and more. Built for contractors and DIYers.',
  keywords: ['construction calculator', 'concrete calculator', 'framing calculator', 'roofing calculator', 'insulation calculator'],
  authors: [{ name: 'Build Calc Pro' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://proconstructioncalc.com',
    siteName: 'Build Calc Pro',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  verification: {
    google: 'nAsuG6MnX4DrPVKMH2QOZZ9xaMxD6cah0oGH9duNjdU',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
