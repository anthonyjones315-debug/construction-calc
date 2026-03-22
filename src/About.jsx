import { useEffect } from 'react'
import { C, font, fontDisplay } from './theme.js'
import { injectSchema, removeSchema, SITE_URL } from './seo/schema.js'

const TIMELINE = [
  {
    years: '3 Years',
    role: 'Union Carpenter',
    icon: '🪚',
    color: '#c96d08',
    desc: 'Started in the trades as a union carpenter — framing, forming, finish work. Learned fast that accurate material counts and tight estimates are what separate profitable jobs from money pits. Every board, every bag of concrete counted.',
  },
  {
    years: 'Next Chapter',
    role: 'Project Management & Estimation',
    icon: '📐',
    color: '#1d6fa4',
    desc: 'Moved off the tools and into project management and estimating. Spent years building out takeoffs, pricing jobs, and watching estimates win or lose bids by a rounding error. Learned every formula the hard way — by getting it wrong first.',
  },
  {
    years: 'Field to Sales',
    role: 'HVAC & Insulation — Residential Sales',
    icon: '🌡️',
    color: '#1a7a4a',
    desc: 'Transitioned into residential HVAC and insulation sales. Walked hundreds of attics and crawl spaces, quoting spray foam, blown-in, and equipment installs. Contractors and homeowners alike always had the same question: "How much do I need?" I kept doing the math in my head. There had to be a better way.',
  },
  {
    years: 'Now',
    role: 'Digital Presence & Build Calc Pro',
    icon: '💻',
    color: '#e8820c',
    desc: 'Now working in digital marketing and online presence for trades businesses — helping contractors get found and grow. Built Build Calc Pro to give contractors and homeowners a fast, no-BS estimating tool that actually reflects how the trades work. No login, no paywall, no fluff.',
  },
]

export default function About() {
  useEffect(() => {
    document.title = 'About — Built by a Union Carpenter | Build Calc Pro'
    const canonical = document.getElementById('canonical-tag')
    if (canonical) canonical.setAttribute('href', 'https://proconstructioncalc.com/about')
    const desc = 'Build Calc Pro was built by a union carpenter turned project manager, estimator, HVAC and insulation sales rep, and digital marketing professional. Free construction calculators built the way the trades actually work.'
    let m = document.querySelector('meta[name="description"]')
    if (m) m.setAttribute('content', desc)

    injectSchema('about-page', {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Build Calc Pro',
      url: SITE_URL + '/about',
      description: desc,
      publisher: {
        '@type': 'Organization',
        name: 'Build Calc Pro',
        url: SITE_URL,
      }
    })

    injectSchema('person', {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Build Calc Pro Founder',
      url: SITE_URL + '/about',
      jobTitle: 'Digital Marketing & Construction Estimating',
      description: 'Former union carpenter with 3 years field experience, followed by project management and estimation, HVAC and insulation residential sales, and digital presence for trades businesses.',
      knowsAbout: [
        'Residential Construction',
        'Construction Estimating',
        'Roof Framing',
        'Concrete Work',
        'Spray Foam Insulation',
        'HVAC Systems',
        'Project Management',
        'Digital Marketing',
      ],
    })

    injectSchema('breadcrumb-about', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Build Calc Pro', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'About', item: SITE_URL + '/about' },
      ]
    })

    return () => {
      removeSchema('about-page')
      removeSchema('person')
      removeSchema('breadcrumb-about')
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font, color: C.text }}>

      {/* Nav */}
      <div style={{
        background: C.navBg, padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ fontFamily: fontDisplay, fontSize: '20px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '0.5px' }}>
          ⚒ BUILD CALC PRO
        </a>
        <a href="/" style={{ fontSize: '13px', color: '#e8820c', fontWeight: '700', textDecoration: 'none', fontFamily: font }}>
          ← Back to Calculators
        </a>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontSize: '12px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', fontFamily: fontDisplay }}>
            About Build Calc Pro
          </div>
          <h1 style={{ fontFamily: fontDisplay, fontSize: '42px', fontWeight: '700', color: C.text, margin: '0 0 20px', lineHeight: '1.1', letterSpacing: '0.5px' }}>
            BUILT BY SOMEONE<br />WHO'S DONE THE MATH ON THE JOB SITE
          </h1>
          <p style={{ fontSize: '17px', color: C.textMid, lineHeight: '1.75', margin: 0, maxWidth: '620px' }}>
            Build Calc Pro wasn't built in a co-working space by someone who's never touched a framing nailer. It was built by someone who spent years in the trades, on job sites, in crawl spaces, and in estimating rooms — and got tired of doing the same calculations over and over on a phone calculator.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ fontFamily: fontDisplay, fontSize: '22px', fontWeight: '700', color: C.text, margin: '0 0 32px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            The Background
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {TIMELINE.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0', position: 'relative' }}>

                {/* Left — timeline stem */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '56px', flexShrink: 0 }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: C.navBg, border: '3px solid ' + item.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', zIndex: 1, flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div style={{ width: '2px', flex: 1, background: C.border, minHeight: '32px' }} />
                  )}
                </div>

                {/* Right — content */}
                <div style={{ paddingBottom: i < TIMELINE.length - 1 ? '36px' : '0', paddingLeft: '20px', flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: item.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', marginTop: '8px' }}>
                    {item.years}
                  </div>
                  <div style={{ fontFamily: fontDisplay, fontSize: '20px', fontWeight: '700', color: C.text, marginBottom: '10px', letterSpacing: '0.3px' }}>
                    {item.role}
                  </div>
                  <p style={{ fontSize: '15px', color: C.textMid, lineHeight: '1.75', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why I built it */}
        <div style={{
          background: C.navBg, borderRadius: '12px', padding: '36px',
          borderLeft: '5px solid ' + C.accent, marginBottom: '48px',
        }}>
          <div style={{ fontFamily: fontDisplay, fontSize: '26px', fontWeight: '700', color: '#fff', marginBottom: '16px', letterSpacing: '0.5px' }}>
            WHY BUILD CALC PRO?
          </div>
          <p style={{ fontSize: '15px', color: '#c4bfb4', lineHeight: '1.8', margin: '0 0 16px' }}>
            Every contractor has a phone and a browser. But most of the calculators out there are either buried in a manufacturer's website, require an account, or spit out numbers that don't match how the field actually works.
          </p>
          <p style={{ fontSize: '15px', color: '#c4bfb4', lineHeight: '1.8', margin: '0 0 16px' }}>
            Build Calc Pro is the tool I wanted when I was running estimates. Fast, honest, no signup. Built around the formulas contractors actually use — with waste factors, real-world units, and results you can hand to a customer or a supplier without second-guessing them.
          </p>
          <p style={{ fontSize: '15px', color: '#c4bfb4', lineHeight: '1.8', margin: 0 }}>
            Whether you're a union carpenter quoting a subfloor, a homeowner trying to figure out how much concrete to order, or an insulation contractor running a spray foam bid — this tool is for you.
          </p>
        </div>

        {/* Mission strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {[
            { icon: '🚫', label: 'No Login Required', desc: 'Open it, use it, close it.' },
            { icon: '💰', label: 'Always Free', desc: 'No paywalls, no "pro" tiers.' },
            { icon: '🎯', label: 'Trade-Accurate', desc: 'Formulas that match field reality.' },
            { icon: '⚡', label: 'Built to Grow', desc: 'More calculators added regularly.' },
          ].map((p, i) => (
            <div key={i} style={{
              background: C.surface, border: '2px solid ' + C.border,
              borderRadius: '10px', padding: '20px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{p.icon}</div>
              <div style={{ fontFamily: fontDisplay, fontSize: '16px', fontWeight: '700', color: C.text, marginBottom: '6px', letterSpacing: '0.3px' }}>{p.label}</div>
              <div style={{ fontSize: '13px', color: C.textDim, lineHeight: '1.5' }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <a href="/" style={{
            display: 'inline-block', background: C.accent, color: '#fff',
            padding: '15px 36px', borderRadius: '8px', fontWeight: '700',
            fontFamily: fontDisplay, fontSize: '18px', letterSpacing: '1px',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Open the Calculators →
          </a>
          <div style={{ marginTop: '16px', fontSize: '13px', color: C.textDim }}>
            Have feedback or a calculator request?{' '}
            <a href="/faq" style={{ color: C.accent, textDecoration: 'none', fontWeight: '600' }}>Check the FAQ</a>
            {' '}or use the feedback button on any page.
          </div>
        </div>

      </div>
    </div>
  )
}
