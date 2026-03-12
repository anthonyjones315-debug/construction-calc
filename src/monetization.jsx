/**
 * Monetization config — affiliate links, lead gen, and referral CTAs
 *
 * HOW TO SET UP AMAZON ASSOCIATES:
 * 1. Go to affiliate-program.amazon.com
 * 2. Sign up (approves in ~24 hrs)
 * 3. Replace AMAZON_TAG below with your Associate tag (e.g. "buildcalcpro-20")
 * 4. All Amazon links below will automatically earn commission
 *
 * HOW TO SET UP ANGI LEADS:
 * 1. Go to angi.com/pro and sign up as a referring partner
 *    OR use Impact.com (impact.com) and search "Angi" — they run their
 *    affiliate program there. Pays $5–25 per lead.
 * 2. Replace ANGI_URL with your referral link
 *
 * HOW TO SET UP THUMBTACK:
 * 1. Search "Thumbtack affiliate" on Impact.com
 * 2. Replace THUMBTACK_URL with your referral link
 */

// ─── YOUR AFFILIATE TAGS — replace these ──────────────────────────────────
const AMAZON_TAG = 'buildcalcpro-20'   // Replace with your Amazon Associate tag
const ANGI_URL   = 'https://www.angi.com/companylist/us/search.htm?utm_source=buildcalcpro' // Replace with your Angi referral link
const THUMBTACK_URL = 'https://www.thumbtack.com/?utm_source=buildcalcpro' // Replace with your Thumbtack referral link

// ─── AMAZON LINK BUILDER ──────────────────────────────────────────────────
function amzn(asin, text, price) {
  return {
    text,
    price,
    url: `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`,
  }
}

// ─── AFFILIATE PRODUCTS BY CALCULATOR ─────────────────────────────────────
// Each key matches a calc ID. Products show after a result is calculated.
export const AFFILIATE_PRODUCTS = {

  sprayfoam: [
    amzn('B004W7BPGM', 'Touch \'n Foam 200 BF Open-Cell Kit', '$89'),
    amzn('B004W7BPGM', 'Dow Froth-Pak 620 BF Closed-Cell Kit', '$299'),
    amzn('B0000BYBRC', 'Tyvek HomeWrap (vapor barrier)', '$85'),
  ],

  cellulose: [
    amzn('B07BRKGT4B', 'Greenfiber INS541LD Cellulose (25 lb bag)', '$22'),
    amzn('B07BRKGT4B', 'US Greenfiber Blow-In Blanket System', '$38'),
    amzn('B000BO8VUQ', 'Rent a Blowing Machine — Home Depot', 'Free w/ purchase'),
  ],

  slab: [
    amzn('B000CDIYZU', 'Quikrete 80 lb Concrete Mix (pallet)', '$7/bag'),
    amzn('B00002N66Q', 'Marshalltown 16" Bull Float', '$42'),
    amzn('B00030HGMO', 'Concrete Expansion Joint (50 ft roll)', '$18'),
  ],

  footing: [
    amzn('B000CDIYZU', 'Quikrete 80 lb Concrete Mix', '$7/bag'),
    amzn('B00004YNOH', 'Sakrete 80 lb Fast-Setting Concrete', '$8/bag'),
    amzn('B003PYRSFK', 'Simpson Strong-Tie Anchor Bolts (50-pk)', '$24'),
  ],

  studs: [
    amzn('B00004RFKB', 'DeWalt 20V MAX Framing Nailer', '$329'),
    amzn('B0000AH5GZ', 'Milwaukee 7-1/4" Circular Saw', '$149'),
    amzn('B00004RFKB', 'Paslode Framing Nails 3-1/2" (2000-pk)', '$55'),
  ],

  rafters: [
    amzn('B00004RFKB', 'DeWalt 12" Compound Miter Saw', '$429'),
    amzn('B00004RFKB', 'Swanson Speed Square', '$12'),
    amzn('B00004RFKB', 'Rafter Angle Square Pro', '$18'),
  ],

  squares: [
    amzn('B07BRKGT4B', 'GAF Timberline HDZ Shingles (bundle)', '$32'),
    amzn('B07BRKGT4B', 'Owens Corning Duration Shingles', '$34'),
    amzn('B00004YNH0', 'Grace Ice & Water Shield (200 sf)', '$75'),
    amzn('B00004RFKB', 'Roofing Nail Gun — Bostitch', '$189'),
  ],

  pitch: [
    amzn('B00004RFKB', 'Digital Angle Finder / Pitch Gauge', '$24'),
    amzn('B00004RFKB', 'Empire Level Magnetic Torpedo Level', '$18'),
    amzn('B07BRKGT4B', 'Swanson 7" Speed Square (2-pack)', '$19'),
  ],

  brick: [
    amzn('B000BO8VUQ', 'Quikrete Mortar Mix 80 lb', '$9/bag'),
    amzn('B00004RFKB', 'Marshalltown 10" Brick Trowel', '$22'),
    amzn('B00004RFKB', 'Goldblatt Brick Jointer Set', '$14'),
  ],

  drywall: [
    amzn('B00004RFKB', 'DeWalt 20V Drywall Screw Gun', '$159'),
    amzn('B000BO8VUQ', 'USG All-Purpose Joint Compound (4.5 gal)', '$28'),
    amzn('B000BO8VUQ', 'Sheetrock Paper Tape (250 ft)', '$7'),
  ],

  wire: [
    amzn('B00004RFKB', 'Klein Tools Non-Contact Voltage Tester', '$24'),
    amzn('B00004RFKB', 'Southwire 12 AWG Wire (250 ft)', '$68'),
    amzn('B00004RFKB', 'Southwire 10 AWG Wire (250 ft)', '$89'),
  ],

  room: [
    amzn('B07BRKGT4B', 'Bosch GLM 50 Laser Distance Measure', '$59'),
    amzn('B07BRKGT4B', 'Leica DISTO D2 Laser Measure', '$109'),
  ],
}

// ─── LEAD GEN CONFIG BY CALCULATOR ────────────────────────────────────────
// Show a "Find a contractor" CTA for high-intent calculators
export const LEAD_GEN = {
  squares: {
    headline: 'Need a roofer in your area?',
    sub: 'Get free quotes from top-rated local roofing contractors.',
    cta: 'Get Free Roofing Quotes',
    url: ANGI_URL,
    source: 'Angi',
  },
  pitch: {
    headline: 'Not a DIY job?',
    sub: 'Connect with local roofing pros who can handle any pitch.',
    cta: 'Find Local Roofers',
    url: ANGI_URL,
    source: 'Angi',
  },
  slab: {
    headline: 'Need a concrete contractor?',
    sub: 'Get free estimates from concrete pros near you.',
    cta: 'Get Concrete Quotes',
    url: ANGI_URL,
    source: 'Angi',
  },
  footing: {
    headline: 'Need a foundation contractor?',
    sub: 'Compare quotes from local foundation specialists.',
    cta: 'Find Foundation Pros',
    url: ANGI_URL,
    source: 'Angi',
  },
  sprayfoam: {
    headline: 'Want spray foam installed professionally?',
    sub: 'Find certified insulation contractors near you.',
    cta: 'Get Insulation Quotes',
    url: THUMBTACK_URL,
    source: 'Thumbtack',
  },
  cellulose: {
    headline: 'Want blown-in insulation installed?',
    sub: 'Find certified insulation contractors near you.',
    cta: 'Get Insulation Quotes',
    url: THUMBTACK_URL,
    source: 'Thumbtack',
  },
  studs: {
    headline: 'Need a framing contractor?',
    sub: 'Get quotes from local framing and carpentry pros.',
    cta: 'Find Framing Pros',
    url: THUMBTACK_URL,
    source: 'Thumbtack',
  },
  wire: {
    headline: 'Electrical work needs a licensed electrician.',
    sub: 'Find licensed electricians near you — free quotes.',
    cta: 'Find Local Electricians',
    url: ANGI_URL,
    source: 'Angi',
  },
  drywall: {
    headline: 'Need drywall hung and finished?',
    sub: 'Get free quotes from drywall contractors near you.',
    cta: 'Find Drywall Pros',
    url: THUMBTACK_URL,
    source: 'Thumbtack',
  },
}

// ─── COMPONENTS ────────────────────────────────────────────────────────────

const C = {
  surface: '#1c1f2b', surfaceAlt: '#23273a', border: '#2e3347',
  accent: '#f59e0b', accentDark: '#d97706', accentSoft: 'rgba(245,158,11,0.12)',
  text: '#f0efe8', textMid: '#9ca3af', textDim: '#6b7280',
  green: '#10b981', greenSoft: 'rgba(16,185,129,0.12)',
  blue: '#60a5fa', blueSoft: 'rgba(96,165,250,0.10)',
}
const font = "'Inter', 'Segoe UI', system-ui, sans-serif"

/**
 * AffiliateSuggestions — shows 2–3 relevant product links after a result
 */
export function AffiliateSuggestions({ calcId }) {
  return null
  const products = AFFILIATE_PRODUCTS[calcId]
  if (!products?.length) return null

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        fontSize: '11px', fontWeight: '700', color: C.textDim,
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span>🛒</span> Related Products
        <span style={{ fontWeight: '400', fontSize: '10px', color: C.textDim, marginLeft: '4px' }}>
          (affiliate links — helps keep this tool free)
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {products.slice(0, 3).map((p, i) => (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '12px',
              padding: '11px 14px',
              background: C.surfaceAlt,
              border: '1px solid ' + C.border,
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.accent
              e.currentTarget.style.background = C.accentSoft
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border
              e.currentTarget.style.background = C.surfaceAlt
            }}
          >
            <span style={{ fontSize: '13px', color: C.textMid, fontFamily: font, lineHeight: '1.3' }}>
              {p.text}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: C.accent, fontFamily: font }}>
                {p.price}
              </span>
              <span style={{
                fontSize: '11px', background: C.accentSoft, color: C.accent,
                padding: '3px 8px', borderRadius: '4px', fontWeight: '600',
                fontFamily: font,
              }}>
                Amazon ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

/**
 * LeadGenCTA — "Find a contractor" block shown after result
 */
export function LeadGenCTA({ calcId }) {
  const cfg = LEAD_GEN[calcId]
  if (!cfg) return null

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px 18px',
      background: C.blueSoft,
      border: '1px solid ' + C.blue,
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: C.blue, marginBottom: '2px', fontFamily: font }}>
          {cfg.headline}
        </div>
        <div style={{ fontSize: '12px', color: C.textDim, fontFamily: font }}>
          {cfg.sub} <span style={{ color: C.textDim }}>via {cfg.source}</span>
        </div>
      </div>
      <a
        href={cfg.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={{
          background: C.blue, color: '#000',
          padding: '10px 20px', borderRadius: '8px',
          fontSize: '13px', fontWeight: '700', fontFamily: font,
          textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        {cfg.cta} →
      </a>
    </div>
  )
}
