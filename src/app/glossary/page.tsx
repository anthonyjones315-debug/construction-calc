import type { Metadata } from "next";
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
    <div className="page-shell flex min-h-screen flex-col bg-[#0F0F10] text-white">
      <Header />
      <main id="main-content" className="flex-1 bg-[#0F0F10]">
        <JsonLD schema={schema} />
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16171C] p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600/15 shadow-inner">
              <BookOpen className="h-7 w-7 text-orange-500" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                Common Terms
              </p>
              <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                Construction & Financial Glossary
              </h1>
              <p className="text-sm text-white/70">
                The language we use across every calculator, estimate PDF, and business tool—defined in plain English.
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-[#16171C] p-4 sm:p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-orange-400">
                <Search className="h-3.5 w-3.5" aria-hidden />
                Calculator Language
              </div>
              <p className="text-sm text-white/70">
                We standardize math inputs (units, rates, spacing) and outputs (LF, SF, CY, BF, $, %) so crews see familiar terms across framing, concrete, roofing, and business calculators.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {CONSTRUCTION_TERMS.map((entry) => (
                  <div
                    key={entry.term}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-orange-400">
                      {entry.term}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/75">{entry.definition}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#16171C] p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                  Quick Links
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <a
                    className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-orange-500/60 hover:text-orange-100"
                    href={routes.calculators}
                  >
                    Open Calculators
                  </a>
                  <a
                    className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-orange-500/60 hover:text-orange-100"
                    href={routes.guide}
                  >
                    Read the User Guide
                  </a>
                  <a
                    className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-orange-500/60 hover:text-orange-100"
                    href={routes.fieldNotes}
                  >
                    Field Notes (Articles)
                  </a>
                  <a
                    className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-orange-500/60 hover:text-orange-100"
                    href={routes.financialTerms}
                  >
                    Financial Terms DB
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#16171C] p-4 sm:p-5">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/80">
                  <Info className="h-3.5 w-3.5 text-orange-400" aria-hidden />
                  Financial Terms
                </div>
                <p className="text-sm text-white/70">
                  Core estimating and business terms powering profit margin, labor rate, lead, and tax calculators.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {FINANCIAL_TERMS.slice(0, 7).map((term) => (
                    <li key={term.key} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="font-semibold text-white">{term.label}:</span>{" "}
                      <span className="text-white/70">{term.definition}</span>
                    </li>
                  ))}
                  <li className="text-xs text-white/60">
                    Full list below.
                  </li>
                </ul>
              </div>
            </aside>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#16171C] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <HardHat className="h-5 w-5 text-orange-400" aria-hidden />
              <h2 className="text-lg font-black uppercase tracking-[0.14em] text-white">
                Financial & Business Terms
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {FINANCIAL_TERMS.map((term) => (
                <div
                  key={term.key}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-orange-400">
                    {term.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/80">{term.definition}</p>
                  {term.unit ? (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/50">
                      Default Unit: {term.unit}
                    </p>
                  ) : null}
                  {term.aliases?.length ? (
                    <p className="mt-1 text-[11px] text-white/50">
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
