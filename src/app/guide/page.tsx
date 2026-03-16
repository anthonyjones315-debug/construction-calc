import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD } from "@/seo";
import { routes } from "@routes";
import {
  Compass,
  Target,
  CheckCircle2,
  Save,
  FileDown,
  Handshake,
  ArrowRightCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "User Guide | Pro Construction Calc",
  description:
    "Fast start guide for Pro Construction Calc—pick the right tool, enter inputs, read results, and share estimates.",
  alternates: { canonical: "https://proconstructioncalc.com/guide" },
};

const HOW_TO_STEPS = [
  {
    title: "Pick a trade tool",
    detail:
      "Open Calculators from the header, then choose Concrete, Framing, Roofing, Mechanical, Finish, Interior, or Business.",
    link: routes.calculators,
    cta: "Open Calculators",
  },
  {
    title: "Set units & inputs",
    detail:
      "Use toggles for total area vs dimensions, yards vs cubic feet, or wall studs vs total studs. Enter lengths, spans, pitch, waste, and pricing where shown.",
    link: routes.calculators,
    cta: "Try a calculator",
  },
  {
    title: "Review results",
    detail:
      "Primary card shows the key output (squares, studs, bid price). Secondary cards list supporting quantities and board feet. Material list suggests an order-ready line item.",
  },
  {
    title: "Save, email, or download",
    detail:
      "Use Finalize & Send to email, Save Estimate to sync to Command Center, or Download PDF for a client-ready document.",
    link: routes.commandCenter,
    cta: "Go to Command Center",
  },
  {
    title: "Use business math",
    detail:
      "Profit Margin, Labor Rate, Lead Estimator, and Tax Save calculators use standardized terms from the Glossary to keep markup, burden, CAC, and tax consistent.",
    link: routes.glossary,
    cta: "Open Glossary",
  },
  {
    title: "Need deeper help?",
    detail:
      "Field Notes covers crew tips, while the Glossary defines every financial and construction term used across the app.",
    link: routes.fieldNotes,
    cta: "Read Field Notes",
  },
];

export default function GuidePage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Pro Construction Calc",
    description:
      "Steps to pick a calculator, set inputs, view results, and share estimates in Pro Construction Calc.",
    url: "https://proconstructioncalc.com/guide",
    step: HOW_TO_STEPS.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: step.detail,
        },
      ],
      url: step.link ?? "https://proconstructioncalc.com",
    })),
  };

  return (
    <div className="page-shell flex min-h-screen flex-col bg-[#0F0F10] text-white">
      <Header />
      <main id="main-content" className="flex-1 bg-[#0F0F10]">
        <JsonLD schema={howToSchema} />
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16171C] p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600/15 shadow-inner">
              <Compass className="h-7 w-7 text-orange-500" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                Quick Start
              </p>
              <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                User Guide
              </h1>
              <p className="text-sm text-white/70">
                Navigate Pro Construction Calc in minutes—pick the right calculator, set inputs confidently, and share estimates.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-3">
              {HOW_TO_STEPS.map((step, idx) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-[#16171C] p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-400">
                        Step {idx + 1}
                      </p>
                      <h2 className="text-lg font-black text-white">{step.title}</h2>
                    </div>
                    {step.link ? (
                      <a
                        href={step.link}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-orange-500/60 hover:text-orange-100"
                      >
                        {step.cta ?? "Open"}
                        <ArrowRightCircle className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-white/75">{step.detail}</p>
                  {idx === 2 ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-white/70">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
                        <p className="mt-1 font-semibold text-white">Primary Result</p>
                        <p>Headline value for ordering or pricing (e.g., Total Squares, Bid Price).</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <Save className="h-4 w-4 text-orange-400" aria-hidden />
                        <p className="mt-1 font-semibold text-white">Material List</p>
                        <p>Order-ready bullet list you can copy or send to suppliers.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </section>

            <aside className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#16171C] p-4 sm:p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-orange-400">
                  <Target className="h-3.5 w-3.5" aria-hidden />
                  Fast answers
                </div>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  <li>Use <strong className="text-white">Area</strong> and <strong className="text-white">Yardage</strong> toggles on concrete, flooring, and siding tools.</li>
                  <li>Waste defaults to 10%; raise it for complex layouts or heavy cutting.</li>
                  <li>Business calculators follow the Glossary for markup vs margin, burden, CAC, and tax math.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#16171C] p-4 sm:p-5">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/80">
                  <Handshake className="h-3.5 w-3.5 text-orange-400" aria-hidden />
                  Share & export
                </div>
                <div className="space-y-2 text-sm text-white/70">
                  <p className="flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-orange-400" aria-hidden />
                    Download branded PDFs from the Results panel.
                  </p>
                  <p className="flex items-center gap-2">
                    <Save className="h-4 w-4 text-orange-400" aria-hidden />
                    Save estimates to Command Center to revisit inputs and outputs.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#16171C] p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                  More help
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <a
                    className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-orange-500/60 hover:text-orange-100"
                    href={routes.glossary}
                  >
                    Open the Glossary
                  </a>
                  <a
                    className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-orange-500/60 hover:text-orange-100"
                    href={routes.faq}
                  >
                    Frequently Asked Questions
                  </a>
                  <a
                    className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-orange-500/60 hover:text-orange-100"
                    href={routes.fieldNotes}
                  >
                    Field Notes Library
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
