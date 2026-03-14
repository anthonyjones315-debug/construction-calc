import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Build Calc Pro',
  description: 'Terms of service for Build Calc Pro construction calculators.',
}

export default function TermsPage() {
  return (

      <div className="flex flex-col min-h-screen bg-[--color-bg]">
        <Header />
        <main id="main-content" className="flex-1">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-display font-bold text-[--color-ink] mb-2">Terms of Service</h1>
            <p className="text-sm text-[--color-ink-dim] mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div className="prose prose-sm max-w-none space-y-6 text-[--color-ink-mid]">

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">1. Acceptance of Terms</h2>
                <p>By accessing or using Build Calc Pro ("the Service") at proconstructioncalc.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">2. Disclaimer — Estimation Purposes Only</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
                  <p className="font-bold mb-1">⚠️ Important Limitation of Liability</p>
                  <p>All calculations provided by Build Calc Pro are <strong>estimates only</strong> and are intended for general planning purposes. These calculators do not account for every site-specific variable, local building code requirement, material waste, or unique project condition.</p>
                  <p className="mt-2">Build Calc Pro, its owners, and affiliates are <strong>not liable</strong> for:</p>
                  <ul className="list-disc ml-4 mt-1 space-y-1">
                    <li>Material shortages or overages resulting from using our estimates</li>
                    <li>Construction delays, cost overruns, or project failures</li>
                    <li>Any injury or property damage related to construction work</li>
                    <li>Errors in calculations due to inaccurate inputs provided by the user</li>
                  </ul>
                  <p className="mt-2">Always verify material quantities with your licensed contractor or supplier before placing orders.</p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">3. Use of the Service</h2>
                <p>You may use Build Calc Pro for personal and commercial construction planning. You agree not to:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Reverse engineer, copy, or redistribute our calculator logic</li>
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Impersonate any person or entity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">4. User Accounts</h2>
                <p>When you create an account, you are responsible for maintaining the security of your account credentials. You are responsible for all activities that occur under your account. Build Calc Pro reserves the right to terminate accounts that violate these terms.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">5. Intellectual Property</h2>
                <p>All content, design, code, and calculator logic on Build Calc Pro is the property of Build Calc Pro and protected by applicable intellectual property laws. You retain ownership of any estimates or project data you create.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">6. Third-Party Services</h2>
                <p>Build Calc Pro uses third-party services including Google Analytics (for usage analytics), Google AdSense (for advertising), Amazon Associates (for affiliate product links), and Supabase (for data storage). Your use of these features is subject to their respective terms and privacy policies.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">7. Advertising</h2>
                <p>Build Calc Pro displays advertisements through Google AdSense and contains affiliate links through Amazon Associates. We receive compensation from these programs. This does not affect our editorial content or calculator accuracy.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">8. Modifications</h2>
                <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms. We will update the "Last updated" date at the top of this page when changes are made.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">9. Governing Law</h2>
                <p>These Terms are governed by the laws of the State of New York, United States. Any disputes arising from these Terms shall be resolved in the courts of Oneida County, New York.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[--color-ink] mb-2">10. Contact</h2>
                <p>For questions about these Terms, contact us through the contact form on our website at proconstructioncalc.com.</p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>

  )
}
