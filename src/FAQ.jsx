import { useState, useEffect } from 'react'

const C = {
  bg: '#111318', surface: '#1c1f2b', surfaceAlt: '#23273a',
  border: '#2e3347', accent: '#f59e0b',
  text: '#f0efe8', textMid: '#9ca3af', textDim: '#6b7280',
}
const font = "'Inter', 'Segoe UI', system-ui, sans-serif"

const FAQS = [
  {
    category: 'Roofing',
    items: [
      {
        q: 'What is roof pitch and how do I measure it?',
        a: 'Roof pitch is the ratio of vertical rise to horizontal run, expressed as X:12. A 6:12 pitch rises 6 inches for every 12 inches of horizontal distance. To measure it, hold a level horizontally against the roof surface, measure 12 inches along the level, then measure straight down to the roof at that point. That measurement in inches is your rise.'
      },
      {
        q: 'How many squares of shingles do I need?',
        a: 'One roofing square covers 100 square feet. To calculate squares, multiply your roof length by width to get the footprint, then multiply by the pitch slope factor to account for the actual surface area. Add 10–15% for waste and hip/ridge cuts. Our Roofing Squares calculator does this automatically.'
      },
      {
        q: 'What roof pitch is too steep to walk on safely?',
        a: 'Most experienced roofers consider 8:12 and above to require extra caution. At 10:12 and above, safety harnesses and ridge anchors are strongly recommended. Above 12:12, staging is typically required. Always follow OSHA fall protection guidelines — a fall protection system is required at heights of 6 feet or more in residential construction.'
      },
      {
        q: 'What is the minimum pitch for asphalt shingles?',
        a: 'Standard asphalt shingles require a minimum 4:12 pitch. Between 2:12 and 4:12, shingles can be installed with a double layer of underlayment and modified installation techniques per manufacturer specs. Below 2:12 is considered low-slope and requires a different roofing system entirely — TPO, EPDM, or modified bitumen.'
      },
    ]
  },
  {
    category: 'Concrete',
    items: [
      {
        q: 'How do I calculate how much concrete I need?',
        a: 'Multiply length × width × thickness (all in feet) then divide by 27 to get cubic yards. For a 20×30 slab at 4 inches thick: 20 × 30 × 0.333 ÷ 27 = 7.4 yards. Always add 5–10% for waste. Our Concrete Slab Calculator handles this automatically including the waste factor.'
      },
      {
        q: 'How thick should a concrete slab be?',
        a: 'Sidewalks and patios: 4 inches. Residential driveways: 4 inches minimum, 6 inches preferred. Garage floors: 4 inches for standard vehicles, 6 inches for heavy trucks or equipment. Commercial driveways: 6–8 inches. Structural slabs should always be engineer-specified.'
      },
      {
        q: 'What PSI concrete should I use for a driveway?',
        a: 'Use 3,500 PSI for standard residential driveways and 4,000 PSI for driveways with heavy vehicle traffic. In freeze-thaw climates like the Northeast, always specify air-entrained concrete for any exterior slab — it dramatically improves resistance to cracking from freeze-thaw cycles.'
      },
      {
        q: 'How long does concrete take to cure?',
        a: 'Concrete reaches about 70% of its design strength in 7 days and full strength at 28 days. You can typically walk on it after 24–48 hours and drive on it after 7 days, but avoid heavy loads until 28 days. Keep it moist during the first week — wet curing significantly improves final strength.'
      },
    ]
  },
  {
    category: 'Insulation',
    items: [
      {
        q: 'What is the difference between open cell and closed cell spray foam?',
        a: 'Open cell foam is soft, spongy, and has an R-value of about R-3.7 per inch. It\'s breathable and more affordable. Closed cell foam is rigid, dense, and has an R-value of R-6 to R-7 per inch. It also acts as a vapor barrier. Use closed cell on exterior walls in cold climates, crawl spaces, and rim joists. Use open cell for interior walls, attic decks, and large cavities where cost matters more than R-value per inch.'
      },
      {
        q: 'What R-value do I need for my climate zone?',
        a: 'Climate Zone 5–6 (Northeast, Midwest): R-49 to R-60 attic, R-20 to R-21 walls. Climate Zone 3–4 (Mid-Atlantic, Southeast): R-38 to R-49 attic, R-13 to R-15 walls. Climate Zone 1–2 (Deep South, Florida): R-30 to R-38 attic, R-13 walls. These are minimum recommendations — higher R-values always improve energy performance.'
      },
      {
        q: 'How many inches of spray foam do I need to hit R-21?',
        a: 'With open cell foam at R-3.7 per inch, you need about 5.7 inches — typically filling a 2×6 stud bay completely. With closed cell foam at R-6.5 per inch, you need about 3.2 inches. Our Spray Foam Calculator will tell you exactly how many board feet you need for your square footage and target thickness.'
      },
      {
        q: 'Can I spray foam over existing insulation?',
        a: 'Generally yes, but it depends on the application. In attics, you can spray foam to the underside of the roof deck over existing blown-in insulation to create a conditioned attic. On walls, existing insulation typically needs to be removed first. Always check local code requirements and manufacturer specs before spraying over any existing material.'
      },
    ]
  },
  {
    category: 'Framing',
    items: [
      {
        q: 'How do I calculate how many studs I need?',
        a: 'For 16-inch on-center framing, divide total linear wall footage by 0.75 and add 1. For 24-inch on-center, divide by 2 and add 1. Then add extra studs for corners (3 per corner), door openings (2 per side), and window openings. Our Stud Calculator handles all of this automatically.'
      },
      {
        q: 'What is the standard stud spacing for exterior walls?',
        a: '16 inches on center is standard for most residential exterior walls. 24 inches on center is allowed by code in many areas and reduces material cost, but limits your sheathing and siding options. Advanced framing (OVE) uses 24-inch spacing with specific corner and header details to improve energy performance by reducing thermal bridging.'
      },
    ]
  },
  {
    category: 'General',
    items: [
      {
        q: 'Are these calculators accurate enough for professional use?',
        a: 'Our calculators use industry-standard formulas and are designed to match how experienced contractors estimate in the field. They\'re accurate for planning, quoting, and material ordering. That said, always verify critical measurements on site and consult local codes and engineer specs for structural applications. Results are estimates — field conditions vary.'
      },
      {
        q: 'What calculators are coming next?',
        a: 'We\'re actively building HVAC load, duct sizing, deck material, stair stringer, paint coverage, and electrical load calculators. Use the feedback link in the footer to request a specific calculator — we prioritize based on what contractors actually need.'
      },
    ]
  }
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '1px solid ' + C.border,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '18px 0', cursor: 'pointer', textAlign: 'left',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '16px', fontFamily: font,
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: '600', color: C.text, lineHeight: '1.4' }}>
          {q}
        </span>
        <span style={{
          fontSize: '18px', color: C.accent, flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
        }}>+</span>
      </button>
      {open && (
        <div style={{
          fontSize: '14px', color: C.textMid, lineHeight: '1.7',
          paddingBottom: '18px', fontFamily: font,
        }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  // Inject FAQ schema for Google rich results
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.flatMap(cat =>
        cat.items.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a }
        }))
      )
    }
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'faq-schema'
    el.text = JSON.stringify(schema)
    document.head.appendChild(el)
    document.title = 'FAQ — Construction Calculator Questions Answered | Build Calc Pro'
    return () => {
      document.getElementById('faq-schema')?.remove()
      document.title = 'Build Calc Pro — Free Construction Calculators'
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', fontFamily: font }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '13px', color: C.accent, fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Build Calc Pro
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: C.text, margin: '0 0 12px' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: C.textMid, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
            Answers to common questions about roofing, concrete, insulation, framing, and our calculators.
          </p>
        </div>

        {/* FAQ sections */}
        {FAQS.map(cat => (
          <div key={cat.category} style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '14px', fontWeight: '700', color: C.accent,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: '4px', fontFamily: font,
            }}>
              {cat.category}
            </h2>
            <div>
              {cat.items.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          background: C.surface, border: '1px solid ' + C.border,
          borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '16px',
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>
            Don't see your question?
          </div>
          <div style={{ fontSize: '14px', color: C.textMid, marginBottom: '16px' }}>
            Use the feedback form to ask — we add new answers regularly.
          </div>
          <a
            href="https://forms.gle/GSKYzCR5pKsAdUfx6"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', background: C.accent, color: '#000',
              padding: '12px 24px', borderRadius: '8px', fontWeight: '700',
              fontSize: '14px', textDecoration: 'none', fontFamily: font,
            }}
          >
            Ask a Question →
          </a>
        </div>

      </div>
    </div>
  )
}
