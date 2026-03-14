import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-orange-brand rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">B</span>
          </div>
          <span className="text-white font-display font-bold text-xl tracking-wide">BUILD CALC PRO</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
          <div className="text-7xl font-display font-black text-orange-brand mb-4">404</div>
          <h1 className="text-white font-semibold text-xl mb-2">Page not found</h1>
          <p className="text-neutral-400 text-sm mb-6">
            That page doesn&apos;t exist. It may have been moved or the link is incorrect.
          </p>
          <div className="space-y-3">
            <Link
              href="/calculators"
              className="block w-full px-4 py-2.5 bg-orange-brand hover:bg-orange-dark text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Open Calculators
            </Link>
            <Link
              href="/"
              className="block w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors text-sm"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
