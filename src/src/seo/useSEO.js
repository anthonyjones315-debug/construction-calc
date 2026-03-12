import { useEffect } from 'react'
import {
  injectSchema,
  removeSchema,
  webAppSchema,
  faqSchemas,
  howToSchemas,
  breadcrumbSchema,
  SITE_NAME,
} from './schema.js'

/**
 * Per-calculator SEO config
 * title       → <title> tag
 * description → <meta name="description">
 * keywords    → <meta name="keywords"> (minor signal, still worth having)
 * faqKey      → key into faqSchemas
 * howToKey    → key into howToSchemas
 */
const CALC_SEO = {
  // ── Concrete ──────────────────────────────────────────────────────────
  slab: {
    title: 'Concrete Slab Calculator — Free | Build Calc Pro',
    description: 'Calculate cubic yards, cubic feet, and 80 lb bags of concrete for any slab. Includes 10% waste factor. Free tool for contractors and DIYers.',
    keywords: 'concrete slab calculator, how much concrete for a slab, cubic yards calculator, concrete calculator contractor',
    faqKey: 'concrete',
    howToKey: 'concreteSlab',
  },
  footing: {
    title: 'Concrete Footing Calculator — Free | Build Calc Pro',
    description: 'Calculate concrete volume for strip and continuous footings. Enter length, width, and depth to get cubic yards with waste factor.',
    keywords: 'concrete footing calculator, strip footing concrete, footing volume calculator',
    faqKey: 'concrete',
  },

  // ── Framing ───────────────────────────────────────────────────────────
  studs: {
    title: 'Wall Stud Calculator — 16" and 24" OC | Build Calc Pro',
    description: 'Calculate the number of studs needed for any wall. Supports 16" and 24" on-center spacing. Includes plate material estimate.',
    keywords: 'wall stud calculator, how many studs, stud spacing calculator, framing calculator',
  },
  rafters: {
    title: 'Rafter Length Calculator — Roof Pitch & Span | Build Calc Pro',
    description: 'Calculate rafter length from building span and roof pitch. Returns rafter length, ridge height, and roof angle.',
    keywords: 'rafter length calculator, roof rafter calculator, rafter span calculator, framing rafter',
  },

  // ── Area ──────────────────────────────────────────────────────────────
  room: {
    title: 'Room Area Calculator — Floor, Wall & Paint | Build Calc Pro',
    description: 'Calculate floor area, wall area, volume, paint gallons, and flooring square footage for any room. Free construction estimating tool.',
    keywords: 'room area calculator, wall area calculator, how much paint for a room, flooring calculator',
  },
  triangle: {
    title: 'Triangle Area Calculator — Gables & Hip Roofs | Build Calc Pro',
    description: 'Calculate the area of a triangular surface for gable ends, hip roof sections, and odd-shaped areas.',
    keywords: 'triangle area calculator, gable area calculator, hip roof calculator',
  },

  // ── Materials ─────────────────────────────────────────────────────────
  brick: {
    title: 'Brick Calculator — How Many Bricks Do I Need? | Build Calc Pro',
    description: 'Calculate how many bricks you need for a wall. Enter wall dimensions and brick size. Includes mortar joint and waste factor.',
    keywords: 'brick calculator, how many bricks, masonry calculator, brick estimator',
  },
  drywall: {
    title: 'Drywall Calculator — Sheets & Square Footage | Build Calc Pro',
    description: 'Calculate how many 4×8 or 4×12 drywall sheets you need. Enter total wall area and sheet size. Includes 12% waste.',
    keywords: 'drywall calculator, how many sheets of drywall, sheetrock calculator, drywall estimator',
  },

  // ── Electrical ────────────────────────────────────────────────────────
  wire: {
    title: 'Wire Gauge & Ampacity Calculator — NEC | Build Calc Pro',
    description: 'Calculate required wire gauge, breaker size, and voltage drop for any electrical circuit. Checks against NEC 3% voltage drop limit.',
    keywords: 'wire gauge calculator, ampacity calculator, voltage drop calculator, NEC wire size, electrical calculator',
  },

  // ── Insulation ────────────────────────────────────────────────────────
  sprayfoam: {
    title: 'Spray Foam Insulation Calculator — Board Feet & R-Value | Build Calc Pro',
    description: 'Calculate board feet of spray foam needed, R-value achieved, kit count, and installed cost for open-cell and closed-cell foam.',
    keywords: 'spray foam calculator, board feet spray foam, spray foam insulation calculator, closed cell open cell foam',
    faqKey: 'sprayFoam',
  },
  cellulose: {
    title: 'Cellulose Insulation Calculator — Bags & R-Value | Build Calc Pro',
    description: 'Calculate how many 30 lb bags of blown-in cellulose insulation you need for attics or dense-pack walls. Enter area and target R-value.',
    keywords: 'cellulose insulation calculator, blown in insulation calculator, how many bags of insulation, dense pack cellulose',
  },

  // ── Roofing ───────────────────────────────────────────────────────────
  pitch: {
    title: 'Roof Pitch Calculator — Angle, Rise/Run & Materials | Build Calc Pro',
    description: 'Calculate roof pitch from rise/run, span, or angle. Get compatible roofing materials, pitch factor, and direct link to shingle estimator. Free tool.',
    keywords: 'roof pitch calculator, roof slope calculator, how to calculate roof pitch, roofing pitch angle, rise over run roof',
    faqKey: 'roofPitch',
    howToKey: 'roofPitch',
  },
  squares: {
    title: 'Roofing Squares Calculator — Shingles & Bundles | Build Calc Pro',
    description: 'Calculate roofing squares, total roof area, and bundle count for any pitched roof. Includes pitch factor and 15% waste.',
    keywords: 'roofing squares calculator, how many shingles do I need, roofing material calculator, bundle calculator roofing',
    faqKey: 'roofingSquares',
  },
}

const DEFAULT_SEO = {
  title: `${SITE_NAME} — Free Professional Construction Calculator`,
  description: 'Free construction calculators for contractors and builders. Concrete, framing, roofing, roof pitch, insulation, electrical, and more.',
  keywords: 'construction calculator, contractor calculator, building calculator, free construction estimator',
}

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setOG(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * useSEO(categoryLabel, calcId)
 * Call from Calculator component on every active calc change.
 */
export function useSEO(categoryLabel, calcId) {
  useEffect(() => {
    const seo = CALC_SEO[calcId] ?? DEFAULT_SEO

    // Title
    document.title = seo.title

    // Standard meta
    setMeta('description', seo.description)
    setMeta('keywords', seo.keywords ?? '')
    setMeta('robots', 'index, follow')

    // Open Graph (Facebook, LinkedIn shares)
    setOG('og:title', seo.title)
    setOG('og:description', seo.description)
    setOG('og:type', 'website')
    setOG('og:site_name', SITE_NAME)

    // Twitter Card
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', seo.title)
    setMeta('twitter:description', seo.description)

    // Inject structured data
    injectSchema('webapp', webAppSchema)

    if (seo.faqKey && faqSchemas[seo.faqKey]) {
      injectSchema('faq', faqSchemas[seo.faqKey])
    } else {
      removeSchema('faq')
    }

    if (seo.howToKey && howToSchemas[seo.howToKey]) {
      injectSchema('howto', howToSchemas[seo.howToKey])
    } else {
      removeSchema('howto')
    }

    if (categoryLabel && calcId) {
      const calcLabel = seo.title.split('—')[0].trim()
      injectSchema('breadcrumb', breadcrumbSchema(categoryLabel, calcLabel))
    }

    return () => {
      removeSchema('faq')
      removeSchema('howto')
      removeSchema('breadcrumb')
    }
  }, [categoryLabel, calcId])
}
