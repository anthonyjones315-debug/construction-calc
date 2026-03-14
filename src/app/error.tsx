'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // TODO: wire Sentry.captureException(error) before v2
  }, [error])

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
          <div className="w-14 h-14 bg-orange-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-orange-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
            </svg>
          </div>
          <h1 className="text-white font-semibold text-xl mb-2">Something went wrong</h1>
          <p className="text-neutral-400 text-sm mb-6">
            An unexpected error occurred. Your calculation data is safe — try refreshing the page.
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-4 py-2.5 bg-orange-brand hover:bg-orange-dark text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
            <a
              href="/"
              className="block w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors text-sm"
            >
              Go to Home
            </a>
          </div>
          {error.digest && (
            <p className="mt-4 text-neutral-700 text-xs">Error ID: {error.digest}</p>
          )}
        </div>
      </div>
    </div>
  )
}
