import { useEffect } from 'react'

const SITE_URL = 'https://proconstructioncalc.com'

const C = {
  bg: '#f4f1eb', surface: '#ffffff', border: '#d9d4c7',
  navBg: '#1a1a1a', accent: '#e8820c',
  text: '#1a1a1a', textMid: '#555248', textDim: '#8c887f',
}
const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif"
const fontDisplay = "'Barlow Condensed', 'DM Sans', system-ui, sans-serif"

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy | Build Calc Pro'
    const desc = 'Privacy policy for Build Calc Pro. Learn how we collect, use, and protect your data on our free construction calculator website.'
    let m = document.querySelector('meta[name="description"]')
    if (m) m.setAttribute('content', desc)

    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'schema-privacy'
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Privacy Policy — Build Calc Pro',
      url: SITE_URL + '/privacy',
      description: desc,
      publisher: { '@type': 'Organization', name: 'Build Calc Pro', url: SITE_URL },
    })
    document.head.appendChild(el)
    return () => document.getElementById('schema-privacy')?.remove()
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

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: fontDisplay, fontSize: '36px', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.5px' }}>PRIVACY POLICY</h1>
        <p style={{ fontSize: '13px', color: C.textDim, marginBottom: '40px' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {[
          {
            heading: 'Overview',
            body: `Build Calc Pro ("we", "us", "our") operates proconstructioncalc.com. This page explains what information we collect, how we use it, and your rights regarding that information. We are committed to protecting your privacy.`,
          },
          {
            heading: 'Information We Collect',
            body: `We do not require you to create an account or provide personal information to use our calculators. We may automatically collect non-personally identifiable information including: browser type and version, pages visited, time and date of visit, and referring URLs. This data is collected through Google Analytics and is used solely to understand how visitors use the site so we can improve it.`,
          },
          {
            heading: 'Google AdSense & Advertising',
            body: `We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to this website or other websites. You may opt out of personalized advertising by visiting Google's Ads Settings at adssettings.google.com. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website. For more information about how Google uses data, visit google.com/policies/privacy/partners.`,
          },
          {
            heading: 'Affiliate Links',
            body: `This site contains affiliate links to products on Amazon.com and other retailers. If you click an affiliate link and make a purchase, we may earn a small commission at no additional cost to you. We only link to products we believe are genuinely useful to our users. Affiliate links are marked with "Amazon ↗" or "sponsored" labels.`,
          },
          {
            heading: 'Google Analytics',
            body: `We use Google Analytics to understand site traffic and usage patterns. Google Analytics collects information such as how often users visit the site, what pages they visit, and what other sites they used prior to coming here. We use this information to improve the site. Google's ability to use and share information collected by Google Analytics is restricted by the Google Analytics Terms of Service and Privacy Policy.`,
          },
          {
            heading: 'Cookies',
            body: `We and our third-party partners (Google AdSense, Google Analytics, Amazon) may use cookies — small text files stored on your device. Cookies help us understand usage patterns and deliver relevant ads. You can control cookies through your browser settings. Disabling cookies may affect some functionality.`,
          },
          {
            heading: 'Disclaimer of Liability',
            body: `All calculator results on Build Calc Pro are estimates only and are provided for informational purposes. Results should not be used as the sole basis for purchasing materials, planning construction, or making engineering decisions. Always verify calculations with a licensed contractor, engineer, or other qualified professional. Build Calc Pro is not liable for any errors, omissions, or outcomes resulting from use of this tool.`,
          },
          {
            heading: "Children's Privacy",
            body: `This site is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us so we can delete it.`,
          },
          {
            heading: 'Changes to This Policy',
            body: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the site after changes constitutes acceptance of the updated policy.`,
          },
          {
            heading: 'Contact',
            body: `If you have questions about this Privacy Policy, you can contact us at: privacy@buildcalcpro.com`,
          },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: C.text, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.heading}</h2>
            <p style={{ fontSize: '14px', color: C.textMid, lineHeight: '1.75' }}>{s.body}</p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid ' + C.border, paddingTop: '24px', fontSize: '12px', color: C.textDim }}>
          © {new Date().getFullYear()} Build Calc Pro — proconstructioncalc.com
        </div>
      </div>
    </div>
  )
}
