import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  HardHat,
  ShieldCheck,
  FileText,
  MapPin,
  ClipboardCheck,
  Clock3,
} from "lucide-react";
import {
  JsonLD,
  getPageMetadata,
  getWebAppSchema,
  getWebSiteSchema,
} from "@/seo";
import { HomeTaxDefaults } from "@/app/HomeTaxDefaults";
import { routes } from "@routes";

export const metadata = getPageMetadata({
  title: "Pro Construction Calc | Contractor-Grade Estimating for the Field",
  description:
    "Contractor-grade estimating for Oneida, Madison, and Herkimer county builders. Trade-specific calculators, NYS-aware tax math, and tools that match how crews actually work in the field.",
  path: "/",
});

export default function HomePage() {
  const localMarketHighlights = [
    {
      icon: MapPin,
      title: "Tri-county fit",
      description:
        "Built around the jobs local crews actually quote in Oneida, Herkimer, and Madison County.",
    },
    {
      icon: ClipboardCheck,
      title: "NYS-aware paperwork",
      description:
        "Estimate math, saved workflows, and guidance that line up better with tax and handoff reality.",
    },
    {
      icon: Clock3,
      title: "Faster field flow",
      description:
        "Open calculators fast, batch cart items, and get back to the truck or customer without dashboard clutter.",
    },
  ];

  const localFastLinks = [
    {
      href: routes.fieldNotes,
      title: "Field Notes",
      description:
        "Local tax, frost-depth, and estimating guidance for tri-county work.",
    },
    {
      href: routes.financialTerms,
      title: "Tax Defaults",
      description:
        "Quick-reference Oneida, Madison, and Herkimer county sales-tax context.",
    },
    {
      href: routes.guide,
      title: "Operator Guide",
      description:
        "The shortest path from calculator run to client-ready estimate.",
    },
  ];

  return (
    <div className="page-shell grid min-h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <JsonLD schema={getWebSiteSchema()} />
      <JsonLD schema={getWebAppSchema()} />
      <Header />
      <main
        id="main-content"
        className="viewport-main px-3 py-3 sm:px-4 sm:py-4 lg:px-4 lg:py-3"
      >
        <section className="home-shell mx-auto h-full min-h-0 w-full max-w-6xl">
          <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[1.35fr_0.92fr]">
            <div className="home-primary-column flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 text-slate-100 transition-colors sm:px-5 sm:py-5 lg:px-5 lg:py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-kicker">
                  Industrial-grade estimating
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Built for contractors
                </span>
              </div>
              <h1 className="home-display-heading mt-2.5 max-w-2xl font-display font-bold">
                Pro Construction Calc
                <span className="mt-2 block text-orange-600">
                  Industrial-grade estimating for New York contractors.
                </span>
              </h1>
              <p className="home-hero-copy mt-2.5 max-w-xl text-[13px] leading-relaxed text-slate-400 sm:text-sm">
                Trade calculators, saved estimates, price book control, and PDF
                workflows shaped for field use instead of generic dashboards.
                Designed for quick quoting around Utica, Rome, Herkimer, Oneida,
                and Madison County jobs.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {/* Primary CTA — full emphasis */}
                <Link
                  href={`${routes.commandCenter}?mode=draft`}
                  prefetch={false}
                  className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-4 py-2.5 text-xs font-black text-white transition-all duration-200 hover:bg-orange-700 active:scale-[0.98]"
                >
                  Start New Estimate{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                {/* Secondary CTAs — ghost/outline, compact */}
                <Link
                  href={routes.calculators}
                  className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-600 px-3 py-2.5 text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 hover:text-white active:scale-[0.98]"
                >
                  Calculators
                </Link>
                <Link
                  href={routes.saved}
                  prefetch={false}
                  className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-600 px-3 py-2.5 text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 hover:text-white active:scale-[0.98]"
                >
                  Saved
                </Link>
                <Link
                  href={routes.pricebook}
                  prefetch={false}
                  className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-600 px-3 py-2.5 text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 hover:text-white active:scale-[0.98]"
                >
                  Price Book
                </Link>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
                    className="home-feature-card rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-orange-600">
                      <Icon className="h-4 w-4" aria-hidden />
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                        {label}
                      </p>
                    </div>
                    <p className="home-detail-copy home-feature-copy mt-1 text-[11px] leading-relaxed text-slate-400">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>

              <HomeTaxDefaults />

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {localMarketHighlights.map(
                  ({ icon: Icon, title, description }) => (
                    <div
                      key={title}
                      className="home-market-card rounded-2xl border border-slate-800 bg-slate-950/55 px-3 py-3"
                    >
                      <div className="flex items-center gap-2 text-orange-500">
                        <Icon className="h-4 w-4" aria-hidden />
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                          {title}
                        </p>
                      </div>
                      <p className="home-detail-copy home-market-copy mt-1.5 text-[11px] leading-relaxed text-slate-400">
                        {description}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="home-secondary-column flex min-h-0 flex-col gap-3 xl:pt-0.5">
              <div className="home-panel rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-100 transition-colors">
                <p className="section-kicker">Explore next</p>
                <div className="mt-2.5 space-y-2">
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
                      prefetch={false}
                      className="block min-h-10 rounded-2xl border border-slate-800 bg-slate-800/80 px-3 py-2.5 transition-all duration-200 hover:border-orange-500/50 hover:bg-slate-800"
                    >
                      <p className="font-display text-sm font-semibold uppercase tracking-wide text-white">
                        {item.title}
                      </p>
                      <p className="home-detail-copy mt-0.5 text-[11px] leading-relaxed text-slate-400">
                        {item.desc}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="home-panel rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors">
                <p className="section-kicker">Tri-County Tax Defaults</p>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {[
                    { county: "Oneida", rate: "8.75%" },
                    { county: "Madison", rate: "8.00%" },
                    { county: "Herkimer", rate: "8.25%" },
                  ].map(({ county, rate }) => (
                    <div
                      key={county}
                      className="rounded-xl border border-slate-800 bg-slate-950/55 px-3 py-2 text-center"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-500">
                        {county}
                      </p>
                      <p className="mt-0.5 text-lg font-black text-white">
                        {rate}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-500">
                  Combined state + local rate · Repairs &amp; maintenance
                </p>
              </div>

              <div className="home-panel rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors">
                <p className="section-kicker">Local contractor shortcuts</p>
                <div className="mt-2.5 space-y-2">
                  {localFastLinks.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      prefetch={false}
                      className="block rounded-2xl border border-slate-800 bg-slate-950/55 px-3 py-3 transition-all duration-200 hover:border-orange-500/50 hover:bg-slate-950"
                    >
                      <p className="text-sm font-display font-semibold uppercase tracking-wide text-white">
                        {item.title}
                      </p>
                      <p className="home-detail-copy mt-1 text-[11px] leading-relaxed text-slate-400">
                        {item.description}
                      </p>
                    </Link>
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
