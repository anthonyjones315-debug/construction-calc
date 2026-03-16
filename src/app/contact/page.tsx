import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactAutoOpenFeedback } from "@/components/contact/ContactAutoOpenFeedback";

export const metadata: Metadata = {
  title: "Contact | Pro Construction Calc",
  description:
    "Send feedback or get in touch with Pro Construction Calc. We use your input to improve our construction calculators.",
};

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
          <div className="rounded-2xl border border-white/10 bg-[#1A1A1C] p-6">
            <ContactAutoOpenFeedback />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
