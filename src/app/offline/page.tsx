import Link from 'next/link'
import { WifiOff, Calculator } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[--color-bg] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-[--color-orange-soft] flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-8 h-8 text-[--color-orange-brand]" />
        </div>
        <h1 className="text-2xl font-display font-bold text-[--color-ink] mb-2">You're offline</h1>
        <p className="text-[--color-ink-dim] mb-6 text-sm leading-relaxed">
          No internet connection. Any calculators you've already opened are available below — your inputs are saved.
        </p>
        <Link
          href="/calculators"
          className="inline-flex items-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          <Calculator className="w-4 h-4" aria-hidden />
          Open Calculators
        </Link>
      </div>
    </div>
  )
}
