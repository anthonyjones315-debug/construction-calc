import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HardHat, Calculator, Sparkles, FileDown } from "lucide-react";

export const metadata: Metadata = {
  title: "About Pro Construction Calc",
  description:
    "Pro Construction Calc is a free suite of construction calculators built for contractors, builders, and DIYers.",
};

export default function AboutPage() {
  return (
    <div className="page-shell flex min-h-screen flex-col bg-[#0F0F10] text-white">
      <Header />
      <main id="main-content" className="flex-1 bg-[#0F0F10]">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {/* Hero */}
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#1A1A1C] p-6 text-white">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/6 shadow-lg">
              <HardHat className="w-8 h-8 text-[#FF8C00]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF8C00]">
                Built for the field
              </p>
              <h1 className="text-3xl font-black uppercase text-white">
                About Pro Construction Calc
              </h1>
              <p className="text-white/60">
                Built for the job site, not the boardroom.
              </p>
              <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
                Estimating without fluff
              </div>
            </div>
          </div>

          <div className="content-card mb-8 overflow-hidden w-full max-h-48 flex items-center justify-center bg-black/20">
            <Image
              src="/images/wall-framing.svg"
              alt="Framing crew layout used to plan stud counts and materials"
              width={1200}
              height={700}
              priority
              className="w-full max-h-48 object-contain overflow-hidden"
            />
          </div>

          <div className="mb-8 space-y-5 rounded-2xl border border-white/10 bg-[#1A1A1C] p-8 leading-relaxed text-white/75">
            <p>
              Pro Construction Calc started with a simple frustration: every
              construction calculator online was either cluttered, required a
              sign-up, or gave you results without explaining the math.
            </p>
            <p>
              We built this for contractors, remodelers, and serious DIYers who
              need fast planning tools — without the fluff. Every calculator
              here uses real construction formulas: NEC ampacity tables,
              standard material yields, proper waste factors.
            </p>
            <p>
              The app is free. There are no paywalls on the calculators. Sign in
              only if you want to save estimates or export PDFs — features that
              require us to store your data.
            </p>
          </div>

          {/* Features grid */}
          <h2 className="mb-4 text-xl font-black uppercase text-white">
            What's included
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              {
                icon: Calculator,
                title: "13 Calculators",
                desc: "Concrete, framing, roofing, insulation, flooring, and more — all free.",
              },
              {
                icon: Sparkles,
                title: "AI Optimizer",
                desc: "Claude AI analyzes your results and suggests cost savings and better material choices.",
              },
              {
                icon: FileDown,
                title: "PDF Export",
                desc: "Generate professional estimate PDFs for clients, bids, or the job site.",
              },
              {
                icon: HardHat,
                title: "Built for the Field",
                desc: "Mobile-friendly, fast, no bloat. Works on any device including your phone on-site.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-[#1A1A1C] p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF8C00]/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#FF8C00]" />
                  </div>
                  <h3 className="font-black uppercase text-white">{title}</h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-white/10 bg-[#1A1A1C] p-8 text-center text-white">
            <h2 className="mb-2 text-xl font-black uppercase text-white">
              Got feedback?
            </h2>
            <p className="mb-4 text-sm text-white/60">
              We actively improve based on what contractors and builders tell us
              they need.
            </p>
            <a
              href="mailto:amj111394@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF8C00] px-5 py-2.5 text-sm font-black uppercase text-black transition-all hover:brightness-95"
            >
              Send Feedback
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
