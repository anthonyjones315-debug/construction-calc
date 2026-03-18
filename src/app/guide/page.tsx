import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getPageMetadata } from "@/seo";
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

export const metadata: Metadata = getPageMetadata({
  title: "User Guide | Pro Construction Calc",
  description:
    "Fast start guide for Pro Construction Calc with calculators, saved estimates, PDF exports, and tri-county tax-aware workflows.",
  path: "/guide",
});

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
    title: "Oneida County workflow",
    detail:
      "If you work in Oneida County, set the county before you price or export. Verify sales tax, confirm ST-124 status for exempt projects, and keep your estimate notes consistent so the PDF matches what you calculated.",
    link: routes.financialTerms,
    cta: "Financial Terms",
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
    <div className="command-theme page-shell flex min-h-dvh flex-col bg-[--color-bg] text-[--color-ink]">
      <Header />
      <main id="main-content" className="viewport-main">
        <JsonLD schema={howToSchema} />
        <div className="viewport-frame max-w-6xl">
          <div className="dark-feature-panel flex items-center gap-3 p-4 text-white">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[--color-orange-brand]/15 shadow-inner">
              <Compass className="h-6 w-6 text-[--color-orange-brand]" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="section-kicker">Quick Start</p>
              <h1 className="font-display text-xl font-bold leading-tight sm:text-2xl">
                User Guide
              </h1>
              <p className="text-sm text-[--color-nav-text]/80">
                Fast workflow reference for calculators, saved estimates, exports, and tri-county tax-aware estimating.
              </p>
            </div>
          </div>

          <div className="grid min-h-0 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="grid gap-3 md:grid-cols-2">
              {HOW_TO_STEPS.map((step, idx) => (
                <div key={step.title} className="content-card p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="section-kicker text-[11px] tracking-[0.16em]">
                        Step {idx + 1}
                      </p>
                      <h2 className="mt-1 text-base font-bold text-[--color-ink]">{step.title}</h2>
                    </div>
                    {step.link ? (
                      <Link
                        href={step.link}
                        className="inline-flex items-center gap-1 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-ink] transition hover:border-[--color-orange-brand]/50 hover:text-[--color-orange-brand]"
                      >
                        {step.cta ?? "Open"}
                        <ArrowRightCircle className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[--color-ink-mid]">{step.detail}</p>
                  {idx === 2 ? (
                    <div className="mt-3 grid gap-2 text-sm">
                      <div className="content-card-muted flex flex-col gap-1 p-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                        <p className="font-semibold text-[--color-ink]">Primary Result</p>
                        <p className="text-[12px] text-[--color-ink-mid]">Headline value for ordering or pricing.</p>
                      </div>
                      <div className="content-card-muted flex flex-col gap-1 p-3">
                        <Save className="h-4 w-4 text-[--color-orange-brand]" aria-hidden />
                        <p className="font-semibold text-[--color-ink]">Material List</p>
                        <p className="text-[12px] text-[--color-ink-mid]">Order-ready list you can copy or send.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </section>

            <aside className="grid gap-3">
              <div className="content-card p-3.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[--color-orange-brand]/30 bg-[--color-orange-brand]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-orange-brand]">
                  <Target className="h-3.5 w-3.5" aria-hidden />
                  Fast answers
                </div>
                <ul className="mt-3 space-y-2 text-[13px] text-[--color-ink-mid]">
                  <li>Use <strong className="text-[--color-ink]">Area</strong> and <strong className="text-[--color-ink]">Yardage</strong> toggles on concrete, flooring, and siding tools.</li>
                  <li>Waste defaults to 10%; raise it for complex layouts or heavy cutting.</li>
                  <li>Business calculators follow the Glossary for markup vs margin, burden, CAC, and tax math.</li>
                </ul>
              </div>

              <div className="content-card p-3.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[--color-orange-brand]/30 bg-[--color-orange-brand]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-orange-brand]">
                  Estimating checklist
                </div>
                <ul className="mt-3 space-y-2 text-[13px] text-[--color-ink-mid]">
                  <li>Use Tax Save with the correct county and ST-124 setting before you export a client-facing estimate.</li>
                  <li>Saved estimates, invoice PDFs, and the financial dashboard reuse the same math so you can audit one workflow against another.</li>
                  <li>Keep a signed ST-124 in the job file for every capital improvement to stay protected at audit time.</li>
                </ul>
              </div>

              <div className="content-card p-3.5">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border trim-nav-border bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-nav-text]">
                  <Handshake className="h-3.5 w-3.5 text-[--color-orange-brand]" aria-hidden />
                  Share & export
                </div>
                <div className="space-y-2 text-[13px] text-[--color-ink-mid]">
                  <p className="flex items-center gap-2">
                    <FileDown className="h-4 w-4 shrink-0 text-[--color-orange-brand]" aria-hidden />
                    Download branded PDFs from the Results panel.
                  </p>
                  <p className="flex items-center gap-2">
                    <Save className="h-4 w-4 shrink-0 text-[--color-orange-brand]" aria-hidden />
                    Save estimates to Command Center to revisit inputs and outputs.
                  </p>
                </div>
              </div>

              <div className="content-card p-3.5">
                <p className="section-kicker text-[11px]">More help</p>
                <div className="mt-3 space-y-2 text-sm">
                  <Link
                    href={routes.glossary}
                    className="content-card-interactive block rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[--color-ink] transition hover:border-[--color-orange-brand]/50 hover:text-[--color-orange-brand]"
                  >
                    Open the Glossary
                  </Link>
                  <Link
                    href={routes.faq}
                    className="content-card-interactive block rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[--color-ink] transition hover:border-[--color-orange-brand]/50 hover:text-[--color-orange-brand]"
                  >
                    Frequently Asked Questions
                  </Link>
                  <Link
                    href={routes.fieldNotes}
                    className="content-card-interactive block rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[--color-ink] transition hover:border-[--color-orange-brand]/50 hover:text-[--color-orange-brand]"
                  >
                    Field Notes Library
                  </Link>
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
