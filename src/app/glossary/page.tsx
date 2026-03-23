import type { Metadata } from "next";
import Link from "next/link";
import { HardHat, BookOpen, Search, Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getPageMetadata } from "@/seo";
import { FINANCIAL_TERMS } from "@/data/financial-terms";
import { routes } from "@routes";

const CONSTRUCTION_TERMS = [
  {
    term: "Lineal Foot (LF)",
    definition: "A straight measurement of length in feet, independent of width or height.",
  },
  {
    term: "Square Foot (SF)",
    definition: "Area equal to a square that is one foot on each side; used for coverage quantities.",
  },
  {
    term: "Cubic Yard (CY)",
    definition: "Volume equal to 27 cubic feet; standard unit for ready-mix concrete.",
  },
  {
    term: "On Center (OC)",
    definition: "Spacing measured from the center of one framing member to the center of the next.",
  },
  {
    term: "Waste Factor",
    definition: "Extra material added to cover cuts, damage, and field adjustments.",
  },
  {
    term: "Pitch (x/12)",
    definition: "Roof slope expressed as inches of rise over 12 inches of run.",
  },
  {
    term: "Board Foot (BF)",
    definition: "Lumber volume unit equal to 1\" × 12\" × 12\" (one-twelfth of a cubic foot).",
  },
];

export const metadata: Metadata = getPageMetadata({
  title: "Construction & Financial Glossary | Pro Construction Calc",
  description:
    "Common construction and financial terms used across Pro Construction Calc. Clear definitions for bids, takeoffs, and business math.",
  path: "/glossary",
});

export default function GlossaryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Pro Construction Calc Glossary",
    description:
      "Common construction and financial terms used across Pro Construction Calc calculators and estimates.",
    url: "https://proconstructioncalc.com/glossary",
    hasDefinedTerm: [
      ...CONSTRUCTION_TERMS.map((entry) => ({
        "@type": "DefinedTerm",
        name: entry.term,
        description: entry.definition,
        inDefinedTermSet: "https://proconstructioncalc.com/glossary",
      })),
      ...FINANCIAL_TERMS.map((term) => ({
        "@type": "DefinedTerm",
        name: term.label,
        description: term.definition,
        inDefinedTermSet: "https://proconstructioncalc.com/glossary",
      })),
    ],
  };

  return (
    <div className="light public-page page-shell">
      <Header />
      <main id="main-content" className="flex-1">
        <JsonLD schema={schema} />
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="dark-feature-panel mb-8 flex items-center gap-4 p-6 text-[--color-ink]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[--color-blue-brand]/15 shadow-inner">
              <BookOpen className="h-7 w-7 text-[--color-blue-brand]" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="section-kicker">Common Terms</p>
              <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-[--color-ink] sm:text-3xl">
                Construction & Financial Glossary
              </h1>
              <p className="mt-2 text-sm text-[--color-ink-mid]">
                The language we use across every calculator, estimate PDF, and business tool—defined in plain English.
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="content-card p-4 sm:p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[--color-blue-brand]/30 bg-[--color-blue-brand]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-blue-brand]">
                <Search className="h-3.5 w-3.5 text-[--color-blue-brand]" aria-hidden />
                Calculator Language
              </div>
              <p className="text-sm text-[--color-ink-mid]">
                We standardize math inputs (units, rates, spacing) and outputs (LF, SF, CY, BF, $, %) so crews see familiar terms across framing, concrete, roofing, and business calculators.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {CONSTRUCTION_TERMS.map((entry) => (
                  <div
                    key={entry.term}
                    className="content-card-muted p-3"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[--color-blue-brand]">
                      {entry.term}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[--color-ink-mid]">
                      {entry.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-3">
              <div className="content-card p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
                  Quick Links
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <Link
                    className="content-card-interactive block rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[--color-ink] transition hover:border-[--color-blue-brand]/50 hover:text-[--color-blue-brand]"
                    href={routes.calculators}
                  >
                    Open Calculators
                  </Link>
                  <Link
                    className="content-card-interactive block rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[--color-ink] transition hover:border-[--color-blue-brand]/50 hover:text-[--color-blue-brand]"
                    href={routes.guide}
                  >
                    Read the User Guide
                  </Link>
                  <Link
                    className="content-card-interactive block rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[--color-ink] transition hover:border-[--color-blue-brand]/50 hover:text-[--color-blue-brand]"
                    href={routes.fieldNotes}
                  >
                    Field Notes (Articles)
                  </Link>
                  <Link
                    className="content-card-interactive block rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[--color-ink] transition hover:border-[--color-blue-brand]/50 hover:text-[--color-blue-brand]"
                    href={routes.financialTerms}
                  >
                    Financial Terms DB
                  </Link>
                </div>
              </div>

              <div className="content-card p-4 sm:p-5">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[--color-blue-brand]/30 bg-[--color-blue-brand]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-blue-brand]">
                  <Info className="h-3.5 w-3.5 text-[--color-blue-brand]" aria-hidden />
                  Financial Terms
                </div>
                <p className="text-sm text-[--color-ink-mid]">
                  Core estimating and business terms powering profit margin, labor rate, lead, and tax calculators.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[--color-ink-mid]">
                  {FINANCIAL_TERMS.slice(0, 7).map((term) => (
                    <li
                      key={term.key}
                      className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2"
                    >
                      <span className="font-semibold text-[--color-ink]">
                        {term.label}:
                      </span>{" "}
                      <span className="text-[--color-ink-mid]">
                        {term.definition}
                      </span>
                    </li>
                  ))}
                  <li className="text-xs text-[--color-ink-dim]">Full list below.</li>
                </ul>
              </div>
            </aside>
          </div>

          <div className="content-card p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <HardHat className="h-5 w-5 text-[--color-blue-brand]" aria-hidden />
              <h2 className="text-lg font-black uppercase tracking-[0.14em] text-[--color-ink]">
                Financial & Business Terms
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {FINANCIAL_TERMS.map((term) => (
                <div
                  key={term.key}
                  className="content-card-muted p-3"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[--color-blue-brand]">
                    {term.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[--color-ink-mid]">
                    {term.definition}
                  </p>
                  {term.unit ? (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[--color-ink-dim]">
                      Default Unit: {term.unit}
                    </p>
                  ) : null}
                  {term.aliases?.length ? (
                    <p className="mt-1 text-[11px] text-[--color-ink-dim]">
                      Also called: {term.aliases.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
