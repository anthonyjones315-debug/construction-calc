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
      "Pick the right unit mode, then enter dimensions, spans, waste, or pricing where the tool asks for it.",
    link: routes.calculators,
    cta: "Try a calculator",
  },
  {
    title: "Review results",
    detail:
      "The primary result gives the headline quantity or bid. Supporting cards cover related quantities and material lists.",
  },
  {
    title: "Save, email, or download",
    detail:
      "Finalize & Send emails the estimate, Save syncs it to Command Center, and Download creates the branded PDF.",
    link: routes.commandCenter,
    cta: "Go to Command Center",
  },
  {
    title: "Use business math",
    detail:
      "Margin, labor, leads, and tax tools all use the same shared terms so pricing stays consistent from quote to export.",
    link: routes.glossary,
    cta: "Open Glossary",
  },
  {
    title: "Oneida County workflow",
    detail:
      "Before export, confirm county, tax basis, and ST-124 status so the final PDF matches the estimate math.",
    link: routes.financialTerms,
    cta: "Financial Terms",
  },
  {
    title: "Need deeper help?",
    detail:
      "Field Notes adds crew tips, and the Glossary explains the financial and construction terms used across the app.",
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
    <div className="command-theme page-shell grid min-h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[--color-bg] text-[--color-ink]">
      <Header />
      <main id="main-content" className="viewport-main overflow-hidden">
        <JsonLD schema={howToSchema} />
        <div className="guide-shell viewport-frame max-w-6xl">
          <section className="guide-hero public-panel-strong">
            <div className="guide-hero-icon">
              <Compass className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="section-kicker">Quick Start</p>
              <h1 className="guide-hero-title text-display-heading">
                User Guide
              </h1>
              <p className="guide-hero-copy text-copy-secondary">
                Fast workflow reference for calculators, saved estimates, exports, and tri-county tax-aware estimating.
              </p>
            </div>
          </section>

          <section className="guide-card-grid">
            {HOW_TO_STEPS.map((step, idx) => (
              <article key={step.title} className="guide-card public-panel">
                <div className="guide-card-header">
                  <div className="min-w-0">
                    <p className="section-kicker text-[11px] tracking-[0.16em]">
                      Step {idx + 1}
                    </p>
                    <h2 className="guide-card-title">{step.title}</h2>
                  </div>
                  {step.link ? (
                    <Link href={step.link} className="public-link-chip">
                      {step.cta ?? "Open"}
                      <ArrowRightCircle className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ) : null}
                </div>
                <p className="guide-card-copy">{step.detail}</p>
                {idx === 2 ? (
                  <div className="guide-mini-stack">
                    <div className="guide-mini-card public-panel-muted">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                      <p className="guide-mini-title">Primary result</p>
                      <p className="guide-mini-copy">Headline value for ordering or pricing.</p>
                    </div>
                    <div className="guide-mini-card public-panel-muted">
                      <Save className="h-4 w-4 text-[--color-orange-brand]" aria-hidden />
                      <p className="guide-mini-title">Material list</p>
                      <p className="guide-mini-copy">Order-ready line items you can copy or send.</p>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}

            <article className="guide-card public-panel">
              <div className="public-chip public-chip-accent">
                <Target className="h-3.5 w-3.5" aria-hidden />
                Fast answers
              </div>
              <ul className="guide-list">
                <li>Use <strong>Area</strong> and <strong>Yardage</strong> toggles on concrete, flooring, and siding tools.</li>
                <li>Waste starts at 10%; raise it for heavy cutting or irregular layouts.</li>
                <li>Business tools reuse glossary terms so markup, margin, burden, CAC, and tax stay aligned.</li>
              </ul>
            </article>

            <article className="guide-card public-panel">
              <div className="public-chip public-chip-accent">
                Operator checks
              </div>
              <ul className="guide-list">
                <li>Pick the right county before exporting a client-facing estimate.</li>
                <li>Saved estimates, invoice PDFs, and the dashboard all reuse the same verified math path.</li>
                <li>Reopen the app after updates so you are not working from a stale service worker.</li>
              </ul>
            </article>

            <article className="guide-card public-panel">
              <div className="public-chip">
                <Handshake className="h-3.5 w-3.5 text-[--color-orange-brand]" aria-hidden />
                Share & export
              </div>
              <div className="guide-list">
                <p className="flex items-center gap-2">
                  <FileDown className="h-4 w-4 shrink-0 text-[--color-orange-brand]" aria-hidden />
                  Download branded PDFs from the Results panel.
                </p>
                <p className="flex items-center gap-2">
                  <Save className="h-4 w-4 shrink-0 text-[--color-orange-brand]" aria-hidden />
                  Save to Command Center to revisit inputs and outputs.
                </p>
              </div>
            </article>

            <article className="guide-card public-panel">
              <p className="section-kicker text-[11px]">More help</p>
              <div className="guide-mini-stack">
                <Link href={routes.glossary} className="public-link-chip">
                  Open Glossary
                </Link>
                <Link href={routes.faq} className="public-link-chip">
                  FAQ
                </Link>
                <Link href={routes.fieldNotes} className="public-link-chip">
                  Field Notes
                </Link>
              </div>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
