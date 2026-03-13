import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Build Calc Pro',
  description: 'Privacy policy for Build Calc Pro.',
}

export default function PrivacyPage() {
  const date = 'March 1, 2025'
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main id="main-content" className="flex-1 bg-[--color-bg]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-display font-bold text-[--color-ink] mb-2">Privacy Policy</h1>
            <p className="text-sm text-[--color-ink-dim] mb-10">Last updated: {date}</p>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 space-y-8 text-sm text-[--color-ink-mid] leading-relaxed">
              <section>
                <h2 className="text-lg font-display font-bold text-[--color-ink] mb-3">What We Collect</h2>
                <p>When you use Build Calc Pro without signing in, we collect no personal data. Calculator inputs are processed entirely in your browser and are not sent to our servers.</p>
                <p className="mt-3">When you create an account, we collect your email address and, if you sign in with Google, your name and profile photo. This data is used solely to operate the account features (saved estimates, PDF export).</p>
              </section>

              <section>
                <h2 className="text-lg font-display font-bold text-[--color-ink] mb-3">Analytics</h2>
                <p>We use Google Analytics (GA4) to understand how people use the app — which calculators are popular, where traffic comes from, and general usage patterns. This data is anonymized and aggregated. We do not use it to identify individuals.</p>
              </section>

              <section>
                <h2 className="text-lg font-display font-bold text-[--color-ink] mb-3">AI Features</h2>
                <p>When you use the AI Optimizer, your calculator results (numbers and units only — no personal data) are sent to Anthropic's Claude API to generate suggestions. We do not send your name, email, or account information to this service.</p>
              </section>

              <section>
                <h2 className="text-lg font-display font-bold text-[--color-ink] mb-3">Advertising</h2>
                <p>We use Google AdSense to display ads. Google may use cookies to serve relevant ads based on your prior visits to other websites. You can opt out at <a href="https://adssettings.google.com" className="text-[--color-orange-brand] hover:underline" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.</p>
              </section>

              <section>
                <h2 className="text-lg font-display font-bold text-[--color-ink] mb-3">Affiliate Links</h2>
                <p>Build Calc Pro participates in the Amazon Associates program. When you click a product link and make a purchase, we may earn a small commission at no extra cost to you.</p>
              </section>

              <section>
                <h2 className="text-lg font-display font-bold text-[--color-ink] mb-3">Data Storage</h2>
                <p>Account data and saved estimates are stored in Supabase (PostgreSQL), hosted on AWS infrastructure. Data is encrypted at rest and in transit.</p>
              </section>

              <section>
                <h2 className="text-lg font-display font-bold text-[--color-ink] mb-3">Your Rights</h2>
                <p>You can delete your account and all associated data at any time by emailing <a href="mailto:privacy@proconstructioncalc.com" className="text-[--color-orange-brand] hover:underline">privacy@proconstructioncalc.com</a>. We will process the request within 30 days.</p>
              </section>

              <section>
                <h2 className="text-lg font-display font-bold text-[--color-ink] mb-3">Contact</h2>
                <p>Questions about this policy: <a href="mailto:privacy@proconstructioncalc.com" className="text-[--color-orange-brand] hover:underline">privacy@proconstructioncalc.com</a></p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  )
}
