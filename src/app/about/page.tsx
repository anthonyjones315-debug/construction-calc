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
import { getPageMetadata } from "@/seo";
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
    <div className="command-theme page-shell flex min-h-screen flex-col bg-[--color-bg] text-[--color-ink]">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="dark-feature-panel relative overflow-hidden px-6 py-7 text-white sm:px-8 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))]" />
            <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(180deg,rgba(249,115,22,0.08),transparent)] lg:block" />
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="section-kicker">Built for the field</span>
                  <span className="rounded-full border trim-nav-border bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[--color-nav-text]">
                    Estimating without fluff
                  </span>
                </div>

                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
                    <HardHat
                      className="h-8 w-8 text-[--color-orange-brand]"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-display text-[clamp(34px,5vw,58px)] font-bold uppercase leading-[0.94] tracking-[0.02em] text-white">
                      About Pro Construction Calc
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[--color-nav-text]/82 sm:text-base">
                      Built for the job site first, not the boardroom. We make
                      estimating tools that stay fast, explain the math, and
                      keep real contractor workflows front and center.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                  <Link
                    href={routes.calculators}
                    className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-[--color-orange-dark] active:scale-[0.98]"
                  >
                    Open Calculators
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href={routes.commandCenter}
                    className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 hover:text-white active:scale-[0.98]"
                  >
                    Command Center
                  </Link>
                  <Link
                    href={routes.guide}
                    className="btn-tactile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 hover:text-white active:scale-[0.98]"
                  >
                    User Guide
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {brandPillars.map((pillar) => (
                    <div
                      key={pillar.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-orange-muted]">
                        {pillar.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[--color-nav-text]/78">
                        {pillar.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border trim-accent-border bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.72))] p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_48%)]" />
                <div className="relative flex h-full min-h-[280px] flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[--color-orange-muted]">
                      Brand Signal
                    </p>
                    <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-[--color-nav-text]/80">
                      Industrial slate panels, jobsite orange action color, and
                      clear uppercase hierarchy keep the product readable under
                      pressure.
                    </p>
                  </div>

                  <div className="relative flex items-center justify-center py-6">
                    <div className="absolute h-44 w-44 rounded-full border border-[--color-orange-brand]/25" />
                    <div className="absolute h-28 w-28 rounded-full border border-[--color-orange-brand]/18" />
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[--color-orange-brand]/18 shadow-[0_0_0_1px_rgba(194,65,12,0.2)]">
                      <DraftingCompass
                        className="h-10 w-10 text-[--color-orange-brand]"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/78">
                        Core calculators
                      </span>
                      <span className="text-sm font-black text-white">
                        Free
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/78">
                        Workflow depth
                      </span>
                      <span className="text-sm font-black text-white">
                        Optional
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/78">
                        Jobsite bias
                      </span>
                      <span className="text-sm font-black text-white">
                        High
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_360px]">
            <div className="content-card p-6 sm:p-7">
              <p className="section-kicker">Why we built it</p>
              <div className="mt-4 space-y-5 text-base leading-relaxed text-[--color-ink-mid]">
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
              <div className="content-card p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[--color-orange-brand]/30 bg-[--color-orange-brand]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-orange-brand]">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  What we optimize for
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[--color-ink-mid]">
                  <li>Fast reads from a truck cab, job trailer, or phone on site.</li>
                  <li>Outputs that support ordering, crew planning, and estimate reviews.</li>
                  <li>A consistent visual system across public pages and signed-in tools.</li>
                </ul>
              </div>

              <div className="content-card p-5">
                <p className="section-kicker text-[11px]">How it fits the job</p>
                <ol className="mt-4 space-y-3 text-sm text-[--color-ink-mid]">
                  {workflowSteps.map((step, index) => (
                    <li
                      key={index}
                      className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-3"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-orange-brand]">
                        Step {index + 1}
                      </span>
                      <p className="mt-1 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </section>

          <section className="mt-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-kicker">What&apos;s included</p>
                <h2 className="mt-2 font-display text-3xl font-bold uppercase text-[--color-ink]">
                  Brand-matched tools for live estimating
                </h2>
              </div>
              <div className="rounded-full border trim-nav-border bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[--color-nav-text]">
                Slate panels. Orange actions. Clear math.
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {includedFeatures.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="content-card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--color-orange-brand]/12 shadow-inner">
                    <Icon
                      className="h-5 w-5 text-[--color-orange-brand]"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold uppercase text-[--color-ink]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[--color-ink-mid]">
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
