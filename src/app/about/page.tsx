import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HardHat, Calculator, Sparkles, FileDown, DraftingCompass } from "lucide-react";
import { AboutContactSection } from "@/components/contact/AboutContactSection";

export const metadata: Metadata = {
  title: "About Pro Construction Calc",
  description:
    "Pro Construction Calc is a contractor-grade suite of construction calculators built for working crews, estimators, and owners.",
};

export default function AboutPage() {
  return (
    <div className="page-shell flex min-h-screen flex-col bg-[#0F0F10] text-white">
      <Header />
      <main id="main-content" className="flex-1 bg-[#0F0F10]">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
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
                Built for the job site first, not the boardroom.
              </p>
              <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
                Estimating without fluff or gimmicks
              </div>
            </div>
          </div>

          <div className="content-card mb-8 w-full max-h-48 overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1C] p-6">
            <div className="flex h-full w-full items-center justify-center">
              <div className="rounded-full bg-orange-600/15 p-5">
                <DraftingCompass size={64} strokeWidth={1.5} className="text-orange-600" aria-hidden />
              </div>
            </div>
          </div>

          <div className="mb-8 space-y-5 rounded-2xl border border-white/10 bg-[#1A1A1C] p-8 leading-relaxed text-white/75">
            <p>
              Pro Construction Calc started with a simple frustration: most construction
              calculators were cluttered, sales funnels, or black boxes that never showed
              the math.
            </p>
            <p>
              We built this for contractors, remodelers, and crew leaders who need fast,
              repeatable planning tools they can trust on site. Every calculator uses
              real construction assumptions: NEC ampacity tables, standard material
              yields, and practical waste factors.
            </p>
            <p>
              The app is free to use. Calculators stay open; account features like saved
              estimates and PDF exports are optional and exist to support active projects,
              not lock you into a subscription.
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
                title: "Trade Calculators",
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
          <AboutContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
