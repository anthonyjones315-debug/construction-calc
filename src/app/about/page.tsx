import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SessionProvider } from 'next-auth/react'
import { HardHat, Calculator, Sparkles, FileDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Build Calc Pro',
  description: 'Build Calc Pro is a free suite of construction calculators built for contractors, builders, and DIYers.',
}

export default function AboutPage() {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main id="main-content" className="flex-1 bg-[--color-bg]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
            {/* Hero */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[--color-nav-bg] flex items-center justify-center shadow-lg shrink-0">
                <HardHat className="w-8 h-8 text-[--color-orange-brand]" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-[--color-ink]">About Build Calc Pro</h1>
                <p className="text-[--color-ink-dim]">Built for the job site, not the boardroom.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 mb-8 space-y-5 text-[--color-ink-mid] leading-relaxed">
              <p>
                Build Calc Pro started with a simple frustration: every construction calculator online was either buried in ads, required a sign-up, or gave you results without explaining the math.
              </p>
              <p>
                We built this for contractors, remodelers, and serious DIYers who need fast, reliable estimates — without the fluff. Every calculator here uses real construction formulas: NEC ampacity tables, standard material yields, proper waste factors.
              </p>
              <p>
                The app is free. There are no paywalls on the calculators. Sign in only if you want to save estimates or export PDFs — features that require us to store your data.
              </p>
            </div>

            {/* Features grid */}
            <h2 className="text-xl font-display font-bold text-[--color-ink] mb-4">What's included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                { icon: Calculator, title: '13 Calculators', desc: 'Concrete, framing, roofing, insulation, flooring, electrical, and more — all free.' },
                { icon: Sparkles, title: 'AI Optimizer', desc: 'Claude AI analyzes your results and suggests cost savings and better material choices.' },
                { icon: FileDown, title: 'PDF Export', desc: 'Generate professional estimate PDFs for clients, bids, or the job site.' },
                { icon: HardHat, title: 'Built for the Field', desc: 'Mobile-friendly, fast, no bloat. Works on any device including your phone on-site.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[--color-orange-soft] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[--color-orange-brand]" />
                    </div>
                    <h3 className="font-semibold text-[--color-ink]">{title}</h3>
                  </div>
                  <p className="text-sm text-[--color-ink-dim] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="bg-[--color-nav-bg] rounded-2xl p-8 text-center">
              <h2 className="text-xl font-display font-bold text-white mb-2">Got feedback?</h2>
              <p className="text-sm text-white/60 mb-4">We actively improve based on what contractors and builders tell us they need.</p>
              <a
                href="mailto:feedback@proconstructioncalc.com"
                className="inline-flex items-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                Send Feedback
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  )
}
