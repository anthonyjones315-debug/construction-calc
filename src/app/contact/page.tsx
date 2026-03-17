import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactAutoOpenFeedback } from "@/components/contact/ContactAutoOpenFeedback";
import { getPageMetadata } from "@/seo";
import {
  BUSINESS_CITY_STATE,
  BUSINESS_EMAIL,
  BUSINESS_NAME,
} from "@/lib/business-identity";

export const metadata: Metadata = getPageMetadata({
  title: "Contact | Pro Construction Calc",
  description:
    "Contact Pro Construction Calc for calculator support, estimate workflow help, and product feedback across the Tri-County New York service area.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="page-shell flex min-h-screen flex-col bg-[#0F0F10] text-white">
      <Header />
      <main id="main-content" className="flex-1 bg-[#0F0F10]">
        <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
          <h1 className="mb-2 text-2xl font-black uppercase text-white">
            Need Help?
          </h1>
          <p className="mb-8 text-sm text-white/60">
            Send a bug report, question, or feature request. We read everything.
          </p>
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#1A1A1C] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-400">
                Business
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {BUSINESS_NAME}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#1A1A1C] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-400">
                Location
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {BUSINESS_CITY_STATE}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#1A1A1C] p-6">
            <p className="mb-4 text-sm text-white/60">
              Prefer email? Reach us at{" "}
              <a
                href={`mailto:${BUSINESS_EMAIL}`}
                className="font-semibold text-orange-300 transition hover:text-orange-200"
              >
                {BUSINESS_EMAIL}
              </a>
              .
            </p>
            <ContactAutoOpenFeedback />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
