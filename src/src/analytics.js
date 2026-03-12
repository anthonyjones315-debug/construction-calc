/**
 * Google Analytics 4 — event tracking
 *
 * SETUP (5 minutes):
 * 1. Go to analytics.google.com → Create account → Create property
 * 2. Choose "Web", enter your URL
 * 3. Copy your Measurement ID (looks like G-XXXXXXXXXX)
 * 4. Replace GA_MEASUREMENT_ID below
 * 5. Paste the gtag script into index.html (see comment there)
 *
 * WHY THIS MATTERS FOR MONEY:
 * GA4 shows you which calculators get used most → double down on those
 * for affiliate products and content. If "spray foam" gets 40% of usage,
 * write a blog post about spray foam costs and link it everywhere.
 */

// Replace with your real GA4 Measurement ID
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'

/**
 * Track a calculator being used
 * Shows up in GA4 as a custom event: "calculator_used"
 */
export function trackCalcUsed(calcId, categoryLabel) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'calculator_used', {
    calculator_id: calcId,
    category: categoryLabel,
  })
}

/**
 * Track an affiliate link click
 * Shows up in GA4 as: "affiliate_click"
 */
export function trackAffiliateClick(productName, calcId) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'affiliate_click', {
    product: productName,
    calculator_id: calcId,
  })
}

/**
 * Track a lead gen CTA click
 * Shows up in GA4 as: "lead_gen_click"
 */
export function trackLeadGenClick(calcId, provider) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'lead_gen_click', {
    calculator_id: calcId,
    provider,
  })
}
