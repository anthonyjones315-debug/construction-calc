import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  Calculator,
  DraftingCompass,
  FileDown,
  HardHat,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AboutContactSection } from "@/components/contact/AboutContactSection";
import { JsonLD, getBreadcrumbSchema, getPageMetadata } from "@/seo";
import { routes } from "@routes";

export const metadata: Metadata = getPageMetadata({
  title: "About Pro Construction Calc",
  description:
    "Pro Construction Calc is a contractor-grade suite of construction calculators built for working crews, estimators, and owners.",
  path: "/about",
});

const brandPillars = [
  {
    title: "Built around field logic",
    detail:
      "Every screen is designed for fast jobsite reads, not demo-day dashboards.",
  },
  {
    title: "Transparent math",
    detail:
      "Material yields, NEC assumptions, waste factors, and quantity outputs stay visible.",
  },
  {
    title: "Optional workflow depth",
    detail:
      "Saved estimates, PDFs, and team tools support active projects without gating core calculators.",
  },
];

const includedFeatures = [
  {
    icon: Calculator,
    title: "Trade calculators",
    detail:
      "Concrete, framing, roofing, insulation, flooring, and business math tuned for contractor workflows.",
  },
  {
    icon: Sparkles,
    title: "AI optimizer",
    detail:
      "Result-aware follow-up guidance for cost savings, material choices, and cleaner job planning.",
  },
  {
    icon: FileDown,
    title: "Client-ready PDFs",
    detail:
      "Turn result sets into estimate documents you can hand to clients, crews, or suppliers.",
  },
  {
    icon: ShieldCheck,
    title: "Owner controls",
    detail:
      "Price book, saved estimates, and workspace controls keep repeatable estimating standards in one place.",
  },
];

const workflowSteps = [
  "Open a calculator and pressure-test material counts before you buy.",
  "Use result cards and business tools to sanity-check price, labor, and tax.",
  "Save, export, or send only when the job is active and worth tracking.",
];

export default function AboutPage() {
  return (
    <div className="light public-page page-shell">
      <Header />
      <main id="main-content" className="flex-1">
        <JsonLD schema={getBreadcrumbSchema([{ name: "About", href: "/about" }])} />
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[11px] text-slate-500">
            <Link href="/" className="transition-colors hover:text-[--color-blue-brand]">Home</Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-slate-800">About</span>
          </nav>
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.06),transparent_34%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">
                    Built for the field
                  </span>
                  <span className="rounded-full border border-[--color-border] bg-[--color-surface-alt] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">
                    Estimating without fluff
                  </span>
                </div>

                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[--color-border] bg-[--color-surface-alt]">
                    <HardHat className="h-8 w-8 text-[--color-blue-brand]" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-display text-[clamp(34px,5vw,58px)] font-black uppercase leading-[0.94] tracking-[0.02em] text-[--color-ink]">
                      About Pro Construction Calc
                    </h1>
                    <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[--color-ink-mid] sm:text-base">
                      Built for the job site first, not the boardroom. We make
                      estimating tools that stay fast, explain the math, and
                      keep real contractor workflows front and center.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={routes.calculators}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[--color-blue-brand] px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-[--color-blue-dark] active:scale-[0.98]"
                  >
                    Open Calculators
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href={routes.commandCenter}
                    prefetch={false}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[--color-ink] transition-all duration-200 hover:border-[--color-blue-brand]/60 hover:text-[--color-blue-brand] active:scale-[0.98]"
                  >
                    Command Center
                  </Link>
                  <Link
                    href={routes.guide}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[--color-ink] transition-all duration-200 hover:border-[--color-blue-brand]/60 hover:text-[--color-blue-brand] active:scale-[0.98]"
                  >
                    User Guide
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {brandPillars.map((pillar) => (
                    <div
                      key={pillar.title}
                      className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-5 py-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
                        {pillar.title}
                      </p>
                      <p className="mt-2.5 text-sm leading-relaxed text-[--color-ink-mid]">
                        {pillar.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-[--color-blue-rim] bg-[--color-blue-soft] p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_48%)]" />
                <div className="relative flex h-full min-h-[280px] flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-brand">
                      Brand Signal
                    </p>
                    <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-slate-700">
                      Industrial slate panels, jobsite orange action color, and
                      clear uppercase hierarchy keep the product readable under
                      pressure.
                    </p>
                  </div>

                  <div className="relative flex items-center justify-center py-6">
                    <div className="absolute h-44 w-44 rounded-full border border-[--color-blue-rim]" />
                    <div className="absolute h-28 w-28 rounded-full border border-[--color-blue-rim]/50" />
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[--color-blue-brand]/12 shadow-[0_0_0_1px_rgba(194,65,12,0.15)]">
                      <DraftingCompass
                        className="h-10 w-10 text-blue-brand"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-2xl border border-[--color-blue-rim] bg-white px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Core calculators
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        Free
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-[--color-blue-rim] bg-white px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Workflow depth
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        Optional
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-[--color-blue-rim] bg-white px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Jobsite bias
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        High
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_360px]">
            <div className="rounded-2xl border border-[--color-border] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">Why we built it</p>
              <div className="mt-5 space-y-6 text-[15px] leading-relaxed text-[--color-ink-mid]">
                <p>
                  Pro Construction Calc started with a simple frustration: most
                  construction calculators were cluttered, sales funnels, or
                  black boxes that never showed the math.
                </p>
                <p>
                  We built this for contractors, remodelers, and crew leaders
                  who need fast, repeatable planning tools they can trust on
                  site. The calculators are built around real construction
                  assumptions where they apply: NEC ampacity tables, standard
                  material yields, and practical waste factors.
                </p>
                <p>
                  The core calculator tools are free to use. Account features
                  like saved estimates and workspace workflows are optional and
                  exist to support active projects, not trap you in a
                  subscription.
                </p>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-[--color-border] bg-white p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-[--color-blue-rim] bg-[--color-blue-soft] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  What we optimize for
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[--color-ink-mid]">
                  <li>
                    Fast reads from a truck cab, job trailer, or phone on site.
                  </li>
                  <li>
                    Outputs that support ordering, crew planning, and estimate
                    reviews.
                  </li>
                  <li>
                    A consistent visual system across public pages and signed-in
                    tools.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">
                  How it fits the job
                </p>
                <ol className="mt-5 space-y-3 text-[14px] leading-relaxed text-[--color-ink-mid]">
                  {workflowSteps.map((step, index) => (
                    <li
                      key={index}
                      className="rounded-2xl border border-[--color-border] bg-white px-5 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
                        Step {index + 1}
                      </span>
                      <p className="mt-1.5 font-medium">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </section>

          <section className="mt-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">What's included</p>
                <h2 className="mt-2 text-3xl font-black uppercase text-[--color-ink]">
                  Brand-matched tools for live estimating
                </h2>
              </div>
              <div className="rounded-full border border-[--color-border] bg-[--color-surface-alt] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">
                Industrial look. Fast field math.
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {includedFeatures.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="rounded-2xl border border-[--color-border] bg-white p-6 shadow-sm transition-all hover:border-[--color-blue-brand]/40 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[--color-blue-soft]">
                    <Icon className="h-6 w-6 text-[--color-blue-brand]" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-black uppercase tracking-tight text-[--color-ink]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[--color-ink-mid]">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <AboutContactSection />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
