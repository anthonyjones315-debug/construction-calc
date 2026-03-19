import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  HardHat,
  ShieldCheck,
  FileText,
  Clock3,
  CircleCheck,
  Wrench,
} from "lucide-react";
import {
  JsonLD,
  getPageMetadata,
  getWebAppSchema,
  getWebSiteSchema,
} from "@/seo";
import { routes } from "@routes";

export const metadata = getPageMetadata({
  title: "Pro Construction Calc | Contractor-Grade Estimating for the Field",
  description:
    "Fast, contractor-friendly estimating with trade-specific calculators, saved workflows, and practical field tips for daily jobs.",
  path: "/",
});

export default function HomePage() {
  const workflowHighlights = [
    {
      icon: Clock3,
      title: "Quote in minutes",
      description:
        "Start with calculators, save the result, and move to a client-ready estimate without extra steps.",
    },
    {
      icon: CircleCheck,
      title: "Cleaner handoff",
      description:
        "Keep line items, notes, and totals organized so your team and clients see the same numbers.",
    },
    {
      icon: Wrench,
      title: "Built for crews",
      description:
        "Focus on concrete, framing, roofing, and interior jobs with tools made for field speed.",
    },
  ];

  const quickAccessLinks = [
    {
      href: routes.calculators,
      title: "Open Calculators",
      description:
        "Jump right into trade-specific calculators and start a takeoff fast.",
    },
    {
      href: routes.saved,
      title: "Saved Estimates",
      description:
        "Pick up where you left off without rebuilding estimates from scratch.",
    },
    {
      href: routes.pricebook,
      title: "Price Book",
      description:
        "Standardize labor and material pricing so every quote stays consistent.",
    },
    {
      href: routes.fieldNotes,
      title: "Field Notes",
      description:
        "Use practical pro tips and install guidance while you build each estimate.",
    },
  ];

  const proTips = [
    {
      title: "Start with quantities",
      description:
        "Run measurements first, then add pricing—this keeps revisions simple when scope changes.",
    },
    {
      title: "Save templates",
      description:
        "Store your common jobs and duplicate them instead of rebuilding every estimate.",
    },
    {
      title: "Use client-ready notes",
      description:
        "Add short scope notes while calculating so exports are ready to send immediately.",
    },
  ];

  return (
    <div className="light public-page page-shell grid min-h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <JsonLD schema={getWebSiteSchema()} />
      <JsonLD schema={getWebAppSchema()} />
      <Header />
      <main
        id="main-content"
        className="viewport-main px-3 py-3 sm:px-4 sm:py-4 lg:px-4 lg:py-3"
      >
        <section className="home-shell mx-auto h-full min-h-0 w-full max-w-5xl">
          <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[1.35fr_0.92fr]">
            <div className="home-primary-column flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 transition-colors sm:px-5 sm:py-5 lg:px-5 lg:py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-kicker">
                  Simple estimating workflow
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Built for contractors
                </span>
              </div>
              <h1 className="home-display-heading mt-2.5 max-w-2xl font-display font-bold">
                Pro Construction Calc
                <span className="mt-2 block text-orange-600">
                  Fast, easy-to-use calculators for everyday field estimates.
                </span>
              </h1>
              <p className="home-hero-copy mt-2.5 max-w-xl text-[13px] leading-relaxed text-slate-600 sm:text-sm">
                Run your quantities, apply your pricing, and move straight into
                client-ready estimates. No bloated dashboard flow—just the tools
                you need to quote jobs quickly.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {/* Primary CTA — full emphasis */}
                <Link
                  href={`${routes.commandCenter}?mode=draft`}
                  prefetch={false}
                  className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-black text-white transition-all duration-200 hover:bg-orange-700 active:scale-[0.98]"
                >
                  Start New Estimate{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                {/* Secondary CTAs — ghost/outline, compact */}
                <Link
                  href={routes.calculators}
                  className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:border-orange-300 hover:text-orange-700 active:scale-[0.98]"
                >
                  Calculators
                </Link>
                <Link
                  href={routes.saved}
                  prefetch={false}
                  className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:border-orange-300 hover:text-orange-700 active:scale-[0.98]"
                >
                  Saved
                </Link>
                <Link
                  href={routes.pricebook}
                  prefetch={false}
                  className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:border-orange-300 hover:text-orange-700 active:scale-[0.98]"
                >
                  Price Book
                </Link>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    icon: HardHat,
                    label: "Trade Specific",
                    desc: "Concrete, framing, roofing, insulation, flooring, and more.",
                  },
                  {
                    icon: FileText,
                    label: "Client Ready",
                    desc: "Turn your scope and numbers into clear, sendable estimate outputs.",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Consistent Pricing",
                    desc: "Use saved pricing and estimate history so every quote stays aligned.",
                  },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="home-feature-card rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-orange-600">
                      <Icon className="h-4 w-4" aria-hidden />
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                        {label}
                      </p>
                    </div>
                    <p className="home-detail-copy home-feature-copy mt-1 text-[11px] leading-relaxed text-slate-600">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="home-panel mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="section-kicker">Pro tips</p>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {proTips.map((tip) => (
                    <div
                      key={tip.title}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                        {tip.title}
                      </p>
                      <p className="home-detail-copy mt-1 text-[11px] leading-relaxed text-slate-500">
                        {tip.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {workflowHighlights.map(
                  ({ icon: Icon, title, description }) => (
                    <div
                      key={title}
                      className="home-market-card rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                    >
                      <div className="flex items-center gap-2 text-orange-600">
                        <Icon className="h-4 w-4" aria-hidden />
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900">
                          {title}
                        </p>
                      </div>
                      <p className="home-detail-copy home-market-copy mt-1.5 text-[11px] leading-relaxed text-slate-600">
                        {description}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="home-secondary-column flex min-h-0 flex-col gap-3 xl:pt-0.5">
              <div className="home-panel rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 transition-colors">
                <p className="section-kicker">Quick access</p>
                <div className="mt-2.5 space-y-2">
                  {quickAccessLinks.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      prefetch={false}
                      className="block min-h-10 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50"
                    >
                      <p className="font-display text-sm font-semibold uppercase tracking-wide text-slate-900">
                        {item.title}
                      </p>
                      <p className="home-detail-copy mt-0.5 text-[11px] leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="home-panel rounded-2xl border border-slate-200 bg-white p-4 transition-colors">
                <p className="section-kicker">Popular calculators</p>
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    { name: "Concrete", cat: "concrete" },
                    { name: "Framing", cat: "framing" },
                    { name: "Roofing", cat: "roofing" },
                    { name: "Drywall", cat: "drywall" },
                    { name: "Insulation", cat: "insulation" },
                    { name: "Flooring", cat: "flooring" },
                  ].map(({ name, cat }) => (
                    <Link
                      key={name}
                      href={`${routes.calculators}?c=${cat}`}
                      prefetch={false}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 group-hover:text-orange-700">
                        {name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="home-panel rounded-2xl border border-slate-200 bg-white p-4 transition-colors">
                <p className="section-kicker">Need help?</p>
                <div className="mt-2.5 space-y-2">
                  {[
                    {
                      href: routes.guide,
                      title: "Operator Guide",
                      description:
                        "See the fastest workflow from calculator run to final estimate.",
                    },
                    {
                      href: routes.faq,
                      title: "FAQ",
                      description:
                        "Get quick answers to common quoting and workflow questions.",
                    },
                    {
                      href: routes.contact,
                      title: "Contact",
                      description:
                        "Reach out when you need help tuning your estimating setup.",
                    },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      prefetch={false}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50"
                    >
                      <p className="text-sm font-display font-semibold uppercase tracking-wide text-slate-900">
                        {item.title}
                      </p>
                      <p className="home-detail-copy mt-1 text-[11px] leading-relaxed text-slate-600">
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
