import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, HardHat, ShieldCheck, FileText } from "lucide-react";
import { JsonLD, getPageMetadata, getWebAppSchema, getWebSiteSchema } from "@/seo";
import { NYS_COUNTY_TAX_RATES } from "@/data/nys-tax-rates";
import { useStore } from "@/lib/store";
import { routes } from "@routes";

const TRI_COUNTY_TAX_RATES = ["Oneida", "Madison", "Herkimer"]
  .map((county) => {
    const match = NYS_COUNTY_TAX_RATES.find((entry) => entry.county === county);
    return {
      county,
      combinedRate: match?.combinedRate ?? 0,
    };
  })
  .filter((entry) => entry.combinedRate > 0);

export const metadata = getPageMetadata({
  title: "Pro Construction Calc | Contractor-Grade Estimating for the Field",
  description:
    "Contractor-grade estimating for Oneida, Madison, and Herkimer county builders. Trade-specific calculators, NYS-aware tax math, and tools that match how crews actually work in the field.",
  path: "/",
});

export default function HomePage() {
  const taxRate = useStore((s) => s.taxRate);
  const setTaxRate = useStore((s) => s.setTaxRate);

  function handleTriCountySelect(rate: number) {
    setTaxRate(rate);
  }

  return (
    <div className="page-shell flex min-h-dvh flex-col bg-slate-950 lg:grid lg:grid-rows-[auto_1fr_auto]">
      <JsonLD schema={getWebSiteSchema()} />
      <JsonLD schema={getWebAppSchema()} />
      <Header />
      <main
        id="main-content"
        className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-5 lg:py-3"
      >
        <section className="mx-auto h-full min-h-0 w-full max-w-6xl">
          <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[1.4fr_0.95fr]">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-6 py-6 text-slate-100 transition-colors sm:px-8 sm:py-7 lg:px-7 lg:py-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-kicker">
                  Industrial-grade estimating
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Built for contractors
                </span>
              </div>
              <h1 className="mt-3 max-w-2xl text-4xl font-display font-bold leading-none sm:text-5xl lg:text-4xl xl:text-5xl">
                Pro Construction Calc
                <span className="mt-2 block text-orange-600">
                  Industrial-grade estimating for New York contractors.
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base lg:mt-2.5">
                Trade calculators, saved estimates, price book control, and PDF
                workflows shaped for field use instead of generic dashboards.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:mt-4">
                <Link
                  href={`${routes.commandCenter}?mode=draft`}
                  className="btn-tactile inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-4 py-3 text-sm font-black text-white transition-all duration-200 hover:bg-orange-700 active:scale-[0.98] sm:w-auto"
                >
                  Start New Estimate <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href={routes.calculators}
                  className="btn-tactile inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  Open Calculators
                </Link>
                <Link
                  href={routes.saved}
                  className="btn-tactile inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  Saved Estimates
                </Link>
                <Link
                  href={routes.pricebook}
                  className="btn-tactile inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  Price Book
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:mt-5 xl:grid-cols-3">
                {[
                  {
                    icon: HardHat,
                    label: "Trade-Specific",
                    desc: "Concrete, framing, roofing, insulation, flooring, and more.",
                  },
                  {
                    icon: FileText,
                    label: "Client-Ready PDFs",
                    desc: "From quick checks to client-ready estimate documents you can send.",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Owner Controls",
                    desc: "Price book, team access, and saved project workflows that keep jobs consistent.",
                  },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 lg:px-3.5 lg:py-2.5"
                  >
                    <div className="flex items-center gap-2 text-orange-600">
                      <Icon className="h-4 w-4" aria-hidden />
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
                        {label}
                      </p>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-orange-500/30 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(15,23,42,0.96))] px-4 py-4 lg:mt-3.5 lg:px-3.5 lg:py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                      Tri-County Tax Defaults
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      Configure default regional tax rates for automatic application to new estimates and invoices.
                    </p>
                  </div>
                  <Link
                    href={routes.guide}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-orange-300/40 bg-slate-950/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-orange-300/70"
                  >
                    Tax Compliance Guide
                  </Link>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {TRI_COUNTY_TAX_RATES.map((entry) => {
                    const isActive =
                      Math.abs(entry.combinedRate - taxRate) < 0.0001;
                    return (
                      <button
                        key={entry.county}
                        type="button"
                        onClick={() =>
                          handleTriCountySelect(entry.combinedRate)
                        }
                        className={`flex flex-col items-start rounded-xl border px-3 py-3 text-left transition ${
                          isActive
                            ? "border-orange-400/70 bg-slate-950"
                            : "border-white/10 bg-slate-950/45 hover:border-orange-300/50 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                            {entry.county}
                          </p>
                          {isActive && (
                            <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-orange-300">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xl font-black text-white">
                          {entry.combinedRate.toFixed(2)}%
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Combined NYS + local sales tax
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-4 xl:pt-1">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-100 transition-colors lg:p-4">
                <p className="section-kicker">Explore next</p>
                <div className="mt-3 space-y-3 lg:space-y-2.5">
                  {[
                    {
                      href: routes.blog,
                      title: "Guides & Recommendations",
                      desc: "Long-form methods, planning notes, and material guidance.",
                    },
                    {
                      href: routes.guide,
                      title: "How-To Guide",
                      desc: "Fast operational walkthroughs for estimates, exports, and field use.",
                    },
                    {
                      href: routes.faq,
                      title: "FAQ",
                      desc: "Field questions, quick answers, and estimating context.",
                    },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block min-h-11 rounded-2xl border border-slate-800 bg-slate-800/80 px-4 py-3 transition-all duration-200 hover:border-orange-500/50 hover:bg-slate-800 lg:px-3.5 lg:py-2.5"
                    >
                      <p className="font-display text-base font-semibold uppercase tracking-wide text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {item.desc}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-colors lg:p-4">
                <p className="section-kicker">Why it lands</p>
                <div className="mt-3 grid gap-2.5 md:grid-cols-3">
                  {[
                    "Fast field-first workflows",
                    "Orange actions with clear contrast",
                    "Consistent panels across public and signed-in views",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-400 lg:px-3.5 lg:py-2.5 lg:text-[13px]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
