import type { Metadata } from 'next'
import { JsonLD, getWebAppSchema } from '@/seo'

export const metadata: Metadata = {
  title: 'Free Construction Calculators — Concrete, Framing, Roofing & More | Build Calc Pro',
  description: 'Free online construction calculators for concrete, framing, roofing, insulation, flooring, electrical, and more. Instant results for contractors and DIYers.',
  alternates: { canonical: 'https://proconstructioncalc.com/calculators' },
  openGraph: {
    title: 'Free Construction Calculators | Build Calc Pro',
    description: 'Concrete, framing, roofing, insulation, flooring, wire gauge, and labor calculators — all free.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLD schema={getWebAppSchema()} />
      {children}
    </>
  )
}
