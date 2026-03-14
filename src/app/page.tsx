import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight, Check, Calculator, Sparkles, FileDown, HardHat } from 'lucide-react'
import { CATEGORIES, CALCULATORS } from '@/data'
import { JsonLD, getWebAppSchema, getWebSiteSchema } from '@/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Calc Pro — Free Construction Calculators for Contractors & DIYers',
  description: 'Free professional construction calculators for concrete, framing, roofing, insulation, electrical and more. Built for contractors and serious DIYers.',
  alternates: { canonical: 'https://proconstructioncalc.com' },
}

export default function HomePage() {
  return (

      <div className="flex flex-col min-h-screen bg-[--color-bg]">
        <JsonLD schema={getWebSiteSchema()} />
        <JsonLD schema={getWebAppSchema()} />
        <Header />
        <main id="main-content">

          {/* Hero */}
          <section className="bg-[--color-nav-bg] text-white py-16 sm:py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-[--color-orange-brand]/20 border border-[--color-orange-brand]/30 text-[--color-orange-brand] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[--color-orange-brand] animate-pulse" aria-hidden />
                Now in Beta — Free
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-4">
                Construction Calculators<br />
                <span className="text-[--color-orange-brand]">Built for the Field</span>
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
                Free, accurate estimates for concrete, framing, roofing, insulation, electrical and more.
                No sign-up required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/calculators"
                  className="flex items-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold text-base px-6 py-3 rounded-xl transition-all shadow-lg"
                >
                  Open Calculators <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
                <Link
                  href="/blog"
                  className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium text-base px-6 py-3 rounded-xl transition-all"
                >
                  Read the Guides
                </Link>
              </div>
            </div>
          </section>

          {/* Stats bar */}
          <section className="bg-[--color-orange-brand] py-4 px-4" aria-label="Key features">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-white">
              {[
                { n: '14', label: 'Free Calculators' },
                { n: '100%', label: 'Free to Use' },
                { n: 'AI', label: 'Material Optimizer' },
                { n: 'PDF', label: 'No Account Needed' },
              ].map(({ n, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-display font-bold">{n}</div>
                  <div className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Amazon Associate Ads — 2 units, home page only */}
          <section className="py-6 px-4 bg-[--color-surface-alt] border-b border-gray-200/60">
            <div className="max-w-4xl mx-auto">
              <p className="text-[10px] uppercase tracking-widest text-[--color-ink-dim] text-center mb-3">Sponsored</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ad slot 1 — Concrete tools */}
                <a
                  href="https://www.amazon.com/s?k=concrete+mixing+tools&tag=buildcalcpro-20"
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-3 bg-[--color-surface] border border-gray-200/80 rounded-xl p-4 hover:shadow-md hover:border-[--color-orange-brand]/30 transition-all group"
                  aria-label="Shop concrete mixing tools on Amazon (affiliate link)"
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-2xl shrink-0" aria-hidden>🧱</div>
                  <div>
                    <p className="text-sm font-bold text-[--color-ink] group-hover:text-[--color-orange-brand] transition-colors">Concrete Mixing Tools</p>
                    <p className="text-xs text-[--color-ink-dim]">Paddles, mixers & accessories → Amazon</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[--color-ink-dim] ml-auto shrink-0" aria-hidden />
                </a>

                {/* Ad slot 2 — Framing tools */}
                <a
                  href="https://www.amazon.com/s?k=framing+nailer+tools&tag=buildcalcpro-20"
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-3 bg-[--color-surface] border border-gray-200/80 rounded-xl p-4 hover:shadow-md hover:border-[--color-orange-brand]/30 transition-all group"
                  aria-label="Shop framing nailers on Amazon (affiliate link)"
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-2xl shrink-0" aria-hidden>🔩</div>
                  <div>
                    <p className="text-sm font-bold text-[--color-ink] group-hover:text-[--color-orange-brand] transition-colors">Framing Nailers & Guns</p>
                    <p className="text-xs text-[--color-ink-dim]">Top-rated framing tools → Amazon</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[--color-ink-dim] ml-auto shrink-0" aria-hidden />
                </a>
              </div>
            </div>
          </section>

          {/* Calculator grid */}
          <section className="py-14 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-[--color-ink] text-center mb-2">All Calculators</h2>
              <p className="text-[--color-ink-dim] text-center mb-10 text-sm">Click any to get started — no account needed.</p>

              <div className="space-y-8">
                {CATEGORIES.map(cat => (
                  <div key={cat.id}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] mb-3 flex items-center gap-2">
                      <span aria-hidden>{cat.emoji}</span> {cat.label}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cat.calculators.map(calcId => {
                        const calc = CALCULATORS.find(c => c.id === calcId)
                        if (!calc) return null
                        return (
                          <Link
                            key={calcId}
                            href={`/calculators?c=${calcId}`}
                            className="group bg-[--color-surface] rounded-xl border border-gray-200/80 shadow-sm p-4 hover:shadow-md hover:border-[--color-orange-brand]/40 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl" aria-hidden>{calc.emoji}</span>
                              <div>
                                <p className="font-semibold text-[--color-ink] group-hover:text-[--color-orange-brand] transition-colors text-sm">{calc.label}</p>
                                <p className="text-xs text-[--color-ink-dim] mt-0.5">{calc.blurb}</p>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-[--color-surface] border-t border-gray-100 py-14 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-[--color-ink] text-center mb-10">Why Build Calc Pro?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Calculator, title: 'Real Formulas', desc: 'NEC tables, standard yields, proper waste factors — not rough guesses.' },
                  { icon: Sparkles,   title: 'AI Optimizer',  desc: 'Claude AI suggests cost savings and material tiers for every estimate.' },
                  { icon: FileDown,   title: 'Free PDF',      desc: 'Export professional estimate PDFs instantly — no sign-in required.' },
                  { icon: HardHat,    title: 'Field Ready',   desc: 'Mobile-friendly, fast, works on your phone mid-job.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[--color-orange-soft] flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-[--color-orange-brand]" aria-hidden />
                    </div>
                    <h3 className="font-bold text-[--color-ink] mb-1">{title}</h3>
                    <p className="text-sm text-[--color-ink-dim] leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-[--color-nav-bg] py-14 px-4 text-center">
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-white mb-3">Ready to build smarter?</h2>
              <p className="text-white/60 mb-6 text-sm">Free forever. Sign in only to save estimates.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {['No credit card', 'No ads', 'Free PDF export'].map(f => (
                  <span key={f} className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
                    <Check className="w-3 h-3 text-[--color-orange-brand]" aria-hidden />
                    {f}
                  </span>
                ))}
              </div>
              <Link
                href="/calculators"
                className="inline-flex items-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold px-8 py-3 rounded-xl transition-all text-base"
              >
                Start Calculating Free <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>

        </main>
        <Footer />
      </div>

  )
}
