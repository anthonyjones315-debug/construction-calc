import type { Metadata } from "next";
import { BookOpenCheck, ShieldCheck, FileText, Receipt, HardHat } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD } from "@/seo";
import { FINANCIAL_TERMS } from "@/data/financial-terms";
import { NYS_COUNTY_TAX_RATES } from "@/data/nys-tax-rates";
import { routes } from "@routes";

export const metadata: Metadata = {
  title: "Financial Terms Database & Tax Defaults | Pro Construction Calc",
  description:
    "Central glossary of financial and tax terminology used across all calculators, including NYS capital improvement handling and Oneida County's 8.75% rate.",
  alternates: { canonical: "https://proconstructioncalc.com/financial-terms" },
};

const ONEIDA_RATE = NYS_COUNTY_TAX_RATES.find((c) => c.county === "Oneida")?.combinedRate ?? 8.75;

export default function FinancialTermsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Financial & Tax Terminology",
    description:
      "Industry-standard financial terms, tax defaults, and capital improvement rules used across Pro Construction Calc calculators and PDFs.",
    url: "https://proconstructioncalc.com/financial-terms",
    hasDefinedTerm: FINANCIAL_TERMS.map((term) => ({
      "@type": "DefinedTerm",
      name: term.label,
      description: term.definition,
      inDefinedTermSet: "https://proconstructioncalc.com/financial-terms",
    })),
  };

  return (
    <div className="page-shell flex min-h-screen flex-col bg-[#0F0F10] text-white">
      <Header />
      <main id="main-content" className="flex-1 bg-[#0F0F10]">
        <JsonLD schema={schema} />
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16171C] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600/15 shadow-inner">
              <BookOpenCheck className="h-7 w-7 text-orange-500" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                Common Language
              </p>
              <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                Financial Terms Database
              </h1>
              <p className="text-sm text-white/70">
                One source of truth for markup vs margin, labor burden, CAC, and tax defaults. The same labels appear in every calculator, saved estimate, and client PDF.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-3 rounded-2xl border border-white/10 bg-[#16171C] p-5">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-orange-600/20 p-2 text-orange-400">
                  <Receipt className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-400">
                    NYS Tax Defaults
                  </p>
                  <p className="text-sm text-white/75">
                    Capital Improvements require NYS Form ST-124 (no sales tax on labor). Repairs use the combined county rate.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-400">
                    Oneida County
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">{ONEIDA_RATE.toFixed(2)}%</p>
                  <p className="text-sm text-white/70">
                    Combined state (4.00%) + local (4.75%) rate applied to repairs and maintenance.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-400">
                    Capital Improvement
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    Collect and retain <strong>Form ST-124</strong>; no sales tax billed to the customer. Materials may still be taxable at purchase—plan margin accordingly.
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/60">
                These defaults power the Tax Save calculator, estimate PDFs, and the business price book so tax math is consistent across the platform.
              </p>
            </section>

            <aside className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#16171C] p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-orange-600/20 p-2 text-orange-400">
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-400">
                      Compliance
                    </p>
                    <p className="text-sm text-white/75">2026 NYS all-electric mandate + Marcy UDC</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  <li>All-electric new building mandate starts <strong>January 1, 2026</strong> for most low-rise residential.</li>
                  <li>Town of Marcy UDC: check zoning, site plan triggers, lighting, and stormwater before bidding.</li>
                  <li>Tax Save calculator separates capital improvements (ST-124) from repairs with clear PDF language.</li>
                </ul>
                <a
                  href={routes.fieldNotes}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-orange-500/50 hover:text-orange-100"
                >
                  Read Field Notes
                </a>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#16171C] p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-orange-600/20 p-2 text-orange-400">
                    <FileText className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-400">
                      User Guide
                    </p>
                    <p className="text-sm text-white/75">Stay on-site; no external links.</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  <li>Markup vs Margin, Labor Burden, and CAC use these exact labels in every calculator.</li>
                  <li>Client-ready PDFs pull the same definitions so exports match on-screen math.</li>
                  <li>Glossary and this page share one dataset—no drift between tools.</li>
                </ul>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <a
                    href={routes.guide}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-orange-500/50 hover:text-orange-100"
                  >
                    Open User Guide
                  </a>
                  <a
                    href={routes.glossary}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-orange-500/50 hover:text-orange-100"
                  >
                    View Glossary
                  </a>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#16171C] p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-md bg-orange-600/20 p-2 text-orange-400">
                <HardHat className="h-4 w-4" aria-hidden />
              </div>
              <h2 className="text-lg font-black uppercase tracking-[0.14em] text-white">
                Core Financial & Tax Terms
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
