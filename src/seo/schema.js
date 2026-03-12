/**
 * SEO Schema for Build Calc Pro
 *
 * Injects JSON-LD structured data into the <head> dynamically.
 * Covers:
 *   - WebApplication (tool itself)
 *   - SoftwareApplication (App Store eligibility signal)
 *   - FAQPage (rich result in SERPs — expands in search results)
 *   - BreadcrumbList (per calculator page)
 *   - HowTo (for key calculators — Google shows these as step cards)
 *
 * Usage:
 *   import { injectSchema, removeSchema } from './seo/schema.js'
 *   injectSchema('faq', faqSchema)     // call on mount or route change
 *   removeSchema('faq')                // call on unmount
 */

// ─── BASE SITE URL — update when you have a custom domain ─────────────────
export const SITE_URL = 'https://proconstructioncalc.com'
export const SITE_NAME = 'Build Calc Pro'

// ─── INJECT / REMOVE HELPERS ──────────────────────────────────────────────
export function injectSchema(id, schema) {
  removeSchema(id)
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = `schema-${id}`
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

export function removeSchema(id) {
  const existing = document.getElementById(`schema-${id}`)
  if (existing) existing.remove()
}

// ─── 1. WEB APPLICATION (site-wide) ───────────────────────────────────────
// Tells Google this is a free tool. Eligible for the "Try it" SERP feature.
export const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': ['WebApplication', 'SoftwareApplication'],
  name: SITE_NAME,
  url: SITE_URL,
  description:
    'Free professional construction calculator for contractors and builders. Covers concrete, framing, roofing, roof pitch, insulation (spray foam & cellulose), electrical, and more.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Concrete slab and footing calculator',
    'Roof pitch calculator with material guide',
    'Roofing squares and bundle estimator',
    'Spray foam and cellulose insulation calculator',
    'Wall stud and framing calculator',
    'Electrical wire gauge and ampacity calculator',
    'Drywall sheet estimator',
    'Brick and masonry calculator',
  ],
  screenshot: `${SITE_URL}/screenshot.png`,
  creator: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
}

// ─── 2. FAQ SCHEMA (per calculator) ───────────────────────────────────────
// FAQ rich results expand directly in Google — huge CTR boost for trade queries.

export const faqSchemas = {

  roofPitch: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is roof pitch and how is it measured?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Roof pitch is the ratio of vertical rise to horizontal run, expressed as X/12. A 6/12 pitch means the roof rises 6 inches for every 12 inches of horizontal run. It can also be expressed as an angle — 6/12 equals approximately 26.6 degrees.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the minimum roof pitch for asphalt shingles?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard asphalt shingles require a minimum pitch of 4/12. Low-slope rated shingles with double underlayment can be installed on pitches as low as 2/12. Below 2/12 requires a flat roofing membrane system such as TPO or EPDM.',
        },
      },
      {
        '@type': 'Question',
        name: 'What roofing materials work on a steep pitch?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Steep slope roofs (9/12 and above) work well with wood shakes, slate, clay tile, concrete tile, and metal shingles. These pitches shed water quickly but require special steep-slope fastening techniques and enhanced fall protection during installation.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I calculate roof pitch from rise and run?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Divide the rise (vertical height in inches) by the run (horizontal distance in inches), then multiply by 12. For example, if your roof rises 7.5 inches over a 15-inch run: (7.5 ÷ 15) × 12 = 6, giving you a 6/12 pitch.',
        },
      },
    ],
  },

  concrete: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I calculate how much concrete I need for a slab?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Multiply the length × width × thickness (in feet) to get cubic feet, then divide by 27 to convert to cubic yards. Always add 10% for waste. For example, a 20×12 ft slab at 4 inches thick: (20 × 12 × 0.333) ÷ 27 = 2.96 yards, plus 10% = 3.26 yards.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many 80 lb bags of concrete make a yard?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It takes approximately 45 bags of 80 lb concrete mix to make one cubic yard of concrete. Each 80 lb bag yields about 0.60 cubic feet, and one cubic yard equals 27 cubic feet.',
        },
      },
    ],
  },

  sprayFoam: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the R-value of spray foam insulation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open-cell spray foam has an R-value of approximately R-3.7 per inch. Closed-cell spray foam provides R-6.5 per inch, making it one of the highest R-value insulation options available. Closed-cell also acts as a vapor barrier.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many board feet of spray foam do I need?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Board feet of spray foam = area in square feet × desired thickness in inches. For example, spraying 800 sq ft at 3 inches thick requires 2,400 board feet. A standard 600 BF kit would cover this with one kit at 3" or four 200 BF kits.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between open-cell and closed-cell spray foam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open-cell (0.5 lb density) is softer, cheaper (~$0.44-0.65/BF installed), and has a lower R-value of ~3.7/inch. It is vapor permeable so a separate vapor barrier is needed. Closed-cell (2 lb density) is rigid, more expensive (~$1.00-1.50/BF installed), provides R-6.5/inch, and acts as its own vapor barrier.',
        },
      },
    ],
  },

  roofingSquares: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a roofing square?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A roofing square equals 100 square feet of roof surface area. Shingles and other roofing materials are sold by the square. Most asphalt shingles come 3 bundles per square.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I calculate roofing squares for a pitched roof?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Multiply the building footprint area by the pitch factor (√(1 + (pitch/12)²)), add overhang on all sides, then divide by 100. Always add 15% for waste and cuts. Our roof pitch calculator provides the exact pitch factor for your slope.',
        },
      },
    ],
  },
}

// ─── 3. HOW-TO SCHEMA (key calculators) ───────────────────────────────────
// Google can show How-To rich cards with steps directly in search results.

export const howToSchemas = {

  roofPitch: {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Roof Pitch',
    description: 'Step-by-step guide to measuring and calculating roof pitch for construction and roofing projects.',
    totalTime: 'PT5M',
    tool: [{ '@type': 'HowToTool', name: 'Tape measure or level' }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Measure the run',
        text: 'Place a level horizontally against the roof. Measure 12 inches along the level from where it meets the roof surface — this is your run.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Measure the rise',
        text: 'At the 12-inch mark on your level, measure straight down to the roof surface. This vertical measurement in inches is your rise.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Express as X/12',
        text: 'Your pitch is rise/12. If you measured 6 inches of rise over 12 inches of run, your pitch is 6/12. Enter these values in the calculator above to get angle, multiplier, and compatible materials.',
      },
    ],
  },

  concreteSlab: {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Concrete for a Slab',
    description: 'Calculate how many cubic yards or bags of concrete you need for a concrete slab.',
    totalTime: 'PT3M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Measure length and width',
        text: 'Measure the length and width of your slab in feet.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Determine thickness',
        text: 'Decide on your slab thickness in inches. Standard residential slabs are 4 inches; driveways are typically 6 inches.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Calculate cubic yards',
        text: 'Multiply length × width × (thickness ÷ 12) to get cubic feet, then divide by 27. Add 10% for waste.',
      },
    ],
  },
}

// ─── 4. BREADCRUMB SCHEMA (per calculator) ────────────────────────────────
export function breadcrumbSchema(category, calcLabel) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Build Calc Pro',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category,
        item: `${SITE_URL}/${category.toLowerCase().replace(/\s+/g, '-')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: calcLabel,
        item: `${SITE_URL}/${category.toLowerCase().replace(/\s+/g, '-')}/${calcLabel.toLowerCase().replace(/\s+/g, '-')}`,
      },
    ],
  }
}
