import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, HardHat, ShieldCheck, FileText } from "lucide-react";
import { JsonLD, getWebAppSchema, getWebSiteSchema } from "@/seo";
import type { Metadata } from "next";
import { routes } from "@routes";

export const metadata: Metadata = {
  title: "Pro Construction Calc | Industrial-Grade Estimating for NY Contractors",
  description:
    "The professional bidding engine for Mohawk Valley contractors. 48+ trade-specific calculators, NYS tax compliance, and native Oneida County field guides.",
  alternates: { canonical: "https://proconstructioncalc.com" },
};

export default function HomePage() {
  return (
    <div className="page-shell flex min-h-screen flex-col bg-slate-950 lg:h-dvh lg:overflow-hidden">
      <JsonLD schema={getWebSiteSchema()} />
      <JsonLD schema={getWebAppSchema()} />
      <Header />
      <main
        id="main-content"
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:overflow-hidden lg:py-5"
      >
        <section className="mx-auto h-full w-full max-w-6xl">
          <div className="grid h-full gap-4 xl:grid-cols-[1.4fr_0.95fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden px-6 py-6 text-slate-100 transition-colors sm:px-8 sm:py-7 lg:px-8 lg:py-7">
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
                  Industrial-grade estimating for NY contractors.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                Trade calculators, saved estimates, price book control, and PDF
                workflows shaped for field use instead of generic SaaS
                dashboards.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <Link
                  href={`${routes.commandCenter}?mode=draft`}
                  className="btn-tactile inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-orange-700 active:scale-[0.98] sm:w-auto"
                >
                  Begin Estimate{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden />
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

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    icon: HardHat,
                    label: "Trade-Specific",
                    desc: "Concrete, framing, roofing, insulation, flooring.",
                  },
                  {
                    icon: FileText,
                    label: "Client-Ready PDFs",
                    desc: "From quick math to documents you can actually send.",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Owner Controls",
                    desc: "Price book, team access, and saved project workflows.",
                  },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-orange-600">
                      <Icon className="h-4 w-4" aria-hidden />
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
                        {label}
                      </p>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 xl:pt-1">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-100 transition-colors">
                <p className="section-kicker">Explore next</p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      href: routes.blog,
                      title: "Guides & Recommendations",
                      desc: "Long-form methods, planning notes, and material guidance.",
                    },
                    {
                      href: routes.faq,
                      title: "FAQ",
                      desc: "Field questions, quick answers, and estimating context.",
                    },
                    {
                      href: routes.about,
                      title: "About",
                      desc: "Platform scope, roadmap, and product philosophy.",
                    },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block min-h-11 rounded-2xl border border-slate-800 bg-slate-800/80 px-4 py-3 transition-all duration-200 hover:border-orange-500/50 hover:bg-slate-800"
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
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    "Fast field-first workflows",
                    "Orange actions with clear contrast",
                    "Consistent panels across public and signed-in views",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-400"
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
