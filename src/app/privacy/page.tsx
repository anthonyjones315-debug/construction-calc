import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

const LAST_UPDATED = "March 13, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy — Build Calc Pro",
  description: "Privacy policy for Build Calc Pro construction calculators.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[--color-bg]">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-display font-bold text-[--color-ink] mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-[--color-ink-dim] mb-8">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="space-y-6 text-[--color-ink-mid] text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                1. Overview
              </h2>
              <p>
                Build Calc Pro ("we," "us," or "our") operates
                proconstructioncalc.com. This Privacy Policy explains how we
                collect, use, and protect your information when you use our
                Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                2. Information We Collect
              </h2>
              <p className="font-medium text-[--color-ink] mb-1">
                Information you provide:
              </p>
              <ul className="list-disc ml-4 space-y-1 mb-3">
                <li>
                  Email address, name, and profile photo when you sign in with
                  Google
                </li>
                <li>
                  Email address when you separately opt in for product updates
                </li>
                <li>
                  Business profile info (name, phone, address — optional, used
                  for PDF exports)
                </li>
                <li>Calculator inputs and saved estimates</li>
              </ul>
              <p className="font-medium text-[--color-ink] mb-1">
                Information collected automatically:
              </p>
              <ul className="list-disc ml-4 space-y-1">
                <li>
                  Necessary authentication cookies from Auth.js to keep your
                  session active and secure
                </li>
                <li>
                  Usage data via Google Analytics (pages visited, time on site,
                  device type)
                </li>
                <li>
                  Cookies set by Google AdSense for ad delivery and measurement
                  when optional cookies are accepted
                </li>
                <li>Referral data from Amazon Associates affiliate links</li>
                <li>IP address and browser type (standard web server logs)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                3. Cookies and Advertising
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 mb-3">
                <p className="font-bold mb-1">Cookie banner controls</p>
                <p className="mb-3">
                  Necessary cookies stay enabled because sign-in and site
                  security rely on them. Optional analytics, advertising, and
                  affiliate tracking cookies load only after you accept them
                  through our cookie banner.
                </p>
                <p className="font-bold mb-1">Google AdSense</p>
                <p>
                  We use Google AdSense to display advertisements. Google uses
                  cookies to serve ads based on your prior visits to our website
                  and other sites. You may opt out of personalized advertising
                  by visiting{" "}
                  <a
                    href="https://www.google.com/settings/ads"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Ad Settings
                  </a>
                  .
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
                <p className="font-bold mb-1">Amazon Associates</p>
                <p>
                  Build Calc Pro is a participant in the Amazon Services LLC
                  Associates Program, an affiliate advertising program designed
                  to provide a means for us to earn fees by linking to
                  Amazon.com. When you click Amazon links on our site, Amazon
                  may set cookies to track referrals. See{" "}
                  <a
                    href="https://www.amazon.com/gp/help/customer/display.html?nodeId=468496"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Amazon's Privacy Policy
                  </a>{" "}
                  for details.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                4. How We Use Your Information
              </h2>
              <ul className="list-disc ml-4 space-y-1">
                <li>To provide and improve the Service</li>
                <li>
                  To authenticate you and keep your account session active
                </li>
                <li>To save and retrieve your estimates (signed-in users)</li>
                <li>To personalize your experience</li>
                <li>
                  To send product updates only when you have explicitly opted in
                </li>
                <li>
                  To display relevant advertising through Google AdSense when
                  optional cookies are accepted
                </li>
                <li>
                  To analyze site usage through Google Analytics when optional
                  cookies are accepted
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                5. Marketing Emails and Unsubscribe
              </h2>
              <p>
                We do not use your Google sign-in email for marketing by
                default. Marketing or launch emails are sent only when you
                separately opt in, such as through the updates form. Marketing
                emails should include unsubscribe instructions, and you may opt
                out at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                6. Data Storage and Security
              </h2>
              <p>
                Your data is stored securely in Supabase (PostgreSQL), hosted on
                AWS infrastructure. We implement Row Level Security (RLS) to
                ensure users can only access their own data. We do not sell your
                personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                7. Your Rights
              </h2>
              <p>
                You may request deletion of your account and associated data at
                any time by contacting us. You can also opt out of Google
                Analytics tracking using the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  className="text-[--color-orange-brand] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                8. Children's Privacy
              </h2>
              <p>
                Build Calc Pro is not directed at children under 13. We do not
                knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy periodically. We will update
                the "Last updated" date at the top when changes occur. Continued
                use of the Service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[--color-ink] mb-2">
                10. Contact Us
              </h2>
              <p>
                For privacy-related questions, contact us at
                proconstructioncalc.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
