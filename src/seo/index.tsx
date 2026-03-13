import type { Metadata } from 'next'

// ─── Per-page metadata ────────────────────────────────────────────────────────

interface SEOConfig {
  title: string
  description: string
  canonical?: string
}

const SEO_MAP: Record<string, SEOConfig> = {
  concrete:       { title: 'Concrete Calculator | Build Calc Pro',       description: 'Calculate concrete volume in cubic yards and bags needed for slabs, footings, and forms. Free online concrete calculator.' },
  framing:        { title: 'Wall Framing Calculator | Build Calc Pro',   description: 'Count studs, sheathing sheets, and fasteners for any wall framing project. Includes waste factor and drywall.' },
  roofing:        { title: 'Roofing Calculator | Build Calc Pro',        description: 'Estimate roofing shingles, bundles, and decking from roof dimensions and pitch. Supports shingles and metal roofing.' },
  roofPitch:      { title: 'Roof Pitch Calculator | Build Calc Pro',     description: 'Convert rise and run to pitch ratio, angle in degrees, and slope multiplier. Includes rafter length.' },
  roofingSquares: { title: 'Roofing Squares Calculator | Build Calc Pro',description: 'Calculate roofing squares, shingle bundles, and ridge cap bundles from roof area and pitch.' },
  rafters:        { title: 'Rafter Length Calculator | Build Calc Pro',  description: 'Calculate rafter length, buy length, and total board feet from building span, pitch, and overhang.' },
  flooring:       { title: 'Flooring Calculator | Build Calc Pro',       description: 'Calculate flooring square footage with waste factor and material cost estimate. Works for any flooring type.' },
  insulation:     { title: 'Insulation Calculator | Build Calc Pro',     description: 'Estimate fiberglass batt insulation packs by R-value, stud size, and spacing. Includes waste factor.' },
  sprayfoam:      { title: 'Spray Foam Calculator | Build Calc Pro',     description: 'Calculate spray foam board feet, achieved R-value, and kit count. Supports open and closed cell foam.' },
  cellulose:      { title: 'Cellulose Insulation Calculator | Build Calc Pro', description: 'Estimate blown-in or dense-pack cellulose bags needed for any R-value and area.' },
  siding:         { title: 'Siding Calculator | Build Calc Pro',         description: 'Estimate vinyl or wood siding squares and fasteners from wall area. Includes waste factor.' },
  paint:          { title: 'Paint Calculator | Build Calc Pro',          description: 'Calculate paint gallons needed for any wall area and number of coats. Based on 350 sq ft per gallon coverage.' },
  wireGauge:      { title: 'Wire Gauge Calculator | Build Calc Pro',     description: 'Find correct wire gauge by amperage with NEC ampacity tables and voltage drop calculation.' },
  labor:          { title: 'Labor Cost Calculator | Build Calc Pro',     description: 'Estimate total labor cost from worker count, hours, and hourly wage.' },
  budget:         { title: 'Budget Tracker | Build Calc Pro',            description: 'Track construction material costs with live pricing estimates and AI project analysis.' },
  home:           { title: 'Build Calc Pro — Free Construction Calculators', description: 'Free construction calculators for concrete, framing, roofing, insulation, flooring, electrical and more. Built for contractors and DIYers.' },
  blog:           { title: 'Construction Tips & Guides | Build Calc Pro Blog', description: 'Construction guides, material tips, and how-to articles for contractors and DIYers.' },
  faq:            { title: 'FAQ | Build Calc Pro',                       description: 'Frequently asked questions about construction calculators, material estimates, and using Build Calc Pro.' },
  about:          { title: 'About Build Calc Pro',                       description: 'Build Calc Pro is a free suite of construction calculators built for contractors, builders, and DIYers.' },
  privacy:        { title: 'Privacy Policy | Build Calc Pro',            description: 'Privacy policy for Build Calc Pro. Learn how we handle your data.' },
}

export function getSEOMetadata(page: string): Metadata {
  const config = SEO_MAP[page] ?? SEO_MAP.home
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: config.canonical ?? 'https://proconstructioncalc.com' },
    openGraph: {
      title: config.title,
      description: config.description,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  }
}

// ─── Structured Data / JSON-LD ────────────────────────────────────────────────

export function getWebAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Build Calc Pro',
    url: 'https://proconstructioncalc.com',
    description: 'Free construction calculators for concrete, framing, roofing, insulation, flooring, electrical and more.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'Build Calc Pro', url: 'https://proconstructioncalc.com' },
  }
}

export function getCalculatorSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export function getFAQSchema(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export function getBlogPostSchema(post: { title: string; description: string; slug: string; date: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: `https://proconstructioncalc.com/blog/${post.slug}`,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Build Calc Pro' },
    publisher: {
      '@type': 'Organization',
      name: 'Build Calc Pro',
      url: 'https://proconstructioncalc.com',
    },
  }
}

// ─── JSON-LD Script Component ─────────────────────────────────────────────────

export function JsonLD({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
