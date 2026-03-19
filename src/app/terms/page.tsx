import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import type { Metadata } from "next";
import { getPageMetadata } from "@/seo";
import { BUSINESS_EMAIL } from "@/lib/business-identity";

const EFFECTIVE_DATE = "March 13, 2026";

export const metadata: Metadata = getPageMetadata({
  title: "Terms of Service — Pro Construction Calc",
  description:
    "Terms of service for Pro Construction Calc construction calculators.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="light public-page page-shell">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="dark-feature-panel mb-8 p-6 text-white">
            <p className="section-kicker">Rules of use</p>
            <h1 className="mt-2 text-3xl font-display font-bold">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-[--color-nav-text]/70">
              Pro Construction Calc · Effective Date: {EFFECTIVE_DATE}
            </p>
          </div>

          <div className="content-card mb-8 overflow-hidden">
            <Image
              src="/images/safety-estimate.svg"
              alt="Construction checklist visual reinforcing estimate verification"
              width={1600}
              height={460}
              className="h-48 w-full object-cover sm:h-52"
            />
          </div>

          <div className="content-card prose prose-sm max-w-none space-y-6 p-8 text-[--color-ink-mid]">
            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Pro Construction Calc ("the Service") at
                proconstructioncalc.com, you agree to be bound by these Terms of
                Service. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                2. Disclaimer — Estimation Purposes Only
              </h2>
              <div className="trim-accent-border rounded-xl border bg-[--color-orange-soft] p-4 text-[--color-ink]">
                <p className="font-bold mb-1">
                  ⚠️ Important Limitation of Liability
                </p>
                <p>
                  All calculations provided by Pro Construction Calc are{" "}
                  <strong>estimates only</strong> and are intended for general
                  planning purposes. These calculators do not account for every
                  site-specific variable, local building code requirement,
                  material waste, or unique project condition.
                </p>
                <p className="mt-2">
                  Pro Construction Calc, its owners, and affiliates are{" "}
                  <strong>not liable</strong> for:
                </p>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>
                    Material shortages or overages resulting from using our
                    estimates
                  </li>
                  <li>
                    Construction delays, cost overruns, or project failures
                  </li>
                  <li>
                    Any injury or property damage related to construction work
                  </li>
                  <li>
                    Errors in calculations due to inaccurate inputs provided by
                    the user
                  </li>
                </ul>
                <p className="mt-2">
                  Always verify material quantities with your licensed
                  contractor or supplier before placing orders.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                3. Use of the Service
              </h2>
              <p>
                You may use Pro Construction Calc for personal and commercial
                construction planning. You agree not to:
              </p>
              <ul className="list-disc ml-4 space-y-1">
                <li>
                  Reverse engineer, copy, or redistribute our calculator logic
                </li>
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                4. User Accounts
              </h2>
              <p>
                When you create an account, you are responsible for maintaining
                the security of your account credentials. You are responsible
                for all activities that occur under your account. Pro
                Construction Calc reserves the right to terminate accounts that
                violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                5. Marketing and Communications
              </h2>
              <p>
                Creating an account does not automatically enroll you in
                marketing emails. Product updates or promotional messages may be
                sent only if you separately opt in. Service and account-related
                communications may still be sent when necessary to operate the
                Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                6. Intellectual Property
              </h2>
              <p>
                All content, design, code, and calculator logic on Pro
                Construction Calc is the property of Pro Construction Calc and
                protected by applicable intellectual property laws. You retain
                ownership of any estimates or project data you create.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                7. Third-Party Services
              </h2>
              <p>
                Pro Construction Calc uses third-party services including
                Auth.js and Google OAuth (for authentication), Google Analytics
                (for usage analytics), Google AdSense (for advertising), Amazon
                Associates (for affiliate product links), and Supabase (for data
                storage). Your use of these features is subject to their
                respective terms and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                8. Advertising
              </h2>
              <p>
                Pro Construction Calc displays advertisements through Google
                AdSense and contains affiliate links through Amazon Associates.
                We receive compensation from these programs. Optional
                advertising cookies load only after you accept them through our
                cookie controls.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                9. Modifications
              </h2>
              <p>
                We reserve the right to modify these Terms at any time.
                Continued use of the Service after changes constitutes
                acceptance of the new Terms. We will update the "Last updated"
                date at the top of this page when changes are made.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                10. Governing Law
              </h2>
              <p>
                These Terms are governed by the laws of the State of New York,
                United States. Any disputes arising from these Terms shall be
                resolved in the courts of Oneida County, New York.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                11. Contact
              </h2>
              <p>
                For questions about these Terms, contact us at{" "}
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="text-[--color-orange-brand] hover:underline"
                >
                  {BUSINESS_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
