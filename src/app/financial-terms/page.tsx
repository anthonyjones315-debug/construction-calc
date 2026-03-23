import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, ShieldCheck, FileText, Receipt, HardHat } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getPageMetadata } from "@/seo";
import { FINANCIAL_TERMS } from "@/data/financial-terms";
import { NYS_COUNTY_TAX_RATES } from "@/data/nys-tax-rates";
import { routes } from "@routes";

export const metadata: Metadata = getPageMetadata({
  title: "Financial Terms Database & Tax Defaults | Pro Construction Calc",
  description:
    "Central glossary of financial and tax terminology used across all calculators, including NYS capital improvement handling and Tri-County tax defaults.",
  path: "/financial-terms",
});

const ONEIDA_RATE = NYS_COUNTY_TAX_RATES.find((c) => c.county === "Oneida")?.combinedRate ?? 8.75;
const MADISON_RATE = NYS_COUNTY_TAX_RATES.find((c) => c.county === "Madison")?.combinedRate ?? 8.0;
const HERKIMER_RATE = NYS_COUNTY_TAX_RATES.find((c) => c.county === "Herkimer")?.combinedRate ?? 8.25;

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
    <div className="light public-page page-shell">
      <Header />
      <main
        id="main-content"
        className="flex-1"
      >
        <JsonLD schema={schema} />
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3 dark-feature-panel p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[--color-blue-brand]/15 shadow-inner">
              <BookOpenCheck className="h-7 w-7 text-[--color-blue-brand]" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[--color-blue-brand]">
                Common Language
              </p>
              <h1 className="text-2xl font-black leading-tight text-[--color-ink] sm:text-3xl">
                Financial Terms Database
              </h1>
              <p className="text-sm text-[--color-ink-mid]">
                One source of truth for markup vs margin, labor burden, CAC, and tax defaults. The same labels appear in every calculator, saved estimate, and client PDF.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="content-card space-y-3 rounded-2xl border border-[--color-border] p-5">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-[--color-blue-brand]/20 p-2 text-[--color-blue-brand]">
                  <Receipt className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[--color-blue-brand]">
                    NYS Tax Defaults
                  </p>
                  <p className="text-sm text-[--color-ink-mid]">
                    Capital Improvements require NYS Form ST-124 (no sales tax on labor). Repairs use the combined county rate.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[--color-blue-brand]">
                    Oneida County
                  </p>
                  <p className="mt-1 text-2xl font-black text-[--color-ink]">{ONEIDA_RATE.toFixed(2)}%</p>
                  <p className="text-sm text-[--color-ink-mid]">
                    Combined state (4.00%) + local (4.75%) rate applied to repairs and maintenance.
                  </p>
                </div>
                <div className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[--color-blue-brand]">
                    Madison County
                  </p>
                  <p className="mt-1 text-2xl font-black text-[--color-ink]">{MADISON_RATE.toFixed(2)}%</p>
                  <p className="text-sm text-[--color-ink-mid]">
                    Combined state (4.00%) + local (4.00%) rate applied to repairs and maintenance.
                  </p>
                </div>
                <div className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[--color-blue-brand]">
                    Herkimer County
                  </p>
                  <p className="mt-1 text-2xl font-black text-[--color-ink]">{HERKIMER_RATE.toFixed(2)}%</p>
                  <p className="text-sm text-[--color-ink-mid]">
                    Combined state (4.00%) + local (4.25%) rate applied to repairs and maintenance.
                  </p>
                </div>
                <div className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[--color-blue-brand]">
                    Capital Improvement
                  </p>
                  <p className="mt-1 text-sm text-[--color-ink-mid]">
                    Collect and retain <strong>Form ST-124</strong>; no sales tax billed to the customer. Materials may still be taxable at purchase—plan margin accordingly.
                  </p>
                </div>
              </div>
              <p className="text-xs text-[--color-ink-dim]">
                These defaults power the Tax Save calculator, estimate PDFs, and the business price book so tax math is consistent across the platform.
              </p>
            </section>

            <aside className="space-y-3">
              <div className="content-card rounded-2xl border border-[--color-border] p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-[--color-blue-brand]/20 p-2 text-[--color-blue-brand]">
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[--color-blue-brand]">
                      Operator Notes
                    </p>
                    <p className="text-sm text-[--color-ink-mid]">Tri-county estimating checks that show up in the app today</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[--color-ink-mid]">
                  <li>Tax Save separates capital improvements from repairs so ST-124 jobs do not get mixed with taxable repair work.</li>
                  <li>Saved estimates and exported PDFs use the same tax labels shown in the calculators to reduce drift.</li>
                  <li>Oneida, Madison, and Herkimer defaults are visible here before you audit a live estimate.</li>
                </ul>
                <Link
                  href={routes.fieldNotes}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-ink] transition hover:border-[--color-blue-brand]/40 hover:text-[--color-blue-brand]"
                >
                  Read Field Notes
                </Link>
              </div>

              <div className="content-card rounded-2xl border border-[--color-border] p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-[--color-blue-brand]/20 p-2 text-[--color-blue-brand]">
                    <FileText className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[--color-blue-brand]">
                      User Guide
                    </p>
                    <p className="text-sm text-[--color-ink-mid]">Stay on-site; no external links.</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[--color-ink-mid]">
                  <li>Markup vs Margin, Labor Burden, and CAC use these exact labels in every calculator.</li>
                  <li>Client-ready PDFs pull the same definitions so exports match on-screen math.</li>
                  <li>Glossary and this page share one dataset—no drift between tools.</li>
                </ul>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link
                    href={routes.guide}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-ink] transition hover:border-[--color-blue-brand]/40 hover:text-[--color-blue-brand]"
                  >
                    Open User Guide
                  </Link>
                  <Link
                    href={routes.glossary}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-ink] transition hover:border-[--color-blue-brand]/40 hover:text-[--color-blue-brand]"
                  >
                    View Glossary
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          <div className="content-card mt-4 rounded-2xl border border-[--color-border] p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-md bg-[--color-blue-brand]/20 p-2 text-[--color-blue-brand]">
                <HardHat className="h-4 w-4" aria-hidden />
              </div>
              <h2 className="text-lg font-black uppercase tracking-[0.14em] text-[--color-ink]">
                Core Financial & Tax Terms
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {FINANCIAL_TERMS.map((term) => (
                <div
                  key={term.key}
                  className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-3"
                >
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[--color-blue-brand]">
                    {term.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[--color-ink-mid]">{term.definition}</p>
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
