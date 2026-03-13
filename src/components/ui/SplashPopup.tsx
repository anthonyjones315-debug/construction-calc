'use client'
import { useEffect, useState } from 'react'
import { X, FileDown, Check } from 'lucide-react'

const STORAGE_KEY = 'bcp_beta_splash_v3'

export function SplashPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('https://formspree.io/f/xyknwlrz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'splash_v3' }),
      })
      setSubmitted(true)
      setTimeout(dismiss, 2000)
    } catch { setSubmitted(true) }
    finally { setLoading(false) }
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal
        aria-labelledby="splash-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md
          -translate-x-1/2 -translate-y-1/2
          bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'splashUp 0.25s ease forwards' }}
      >
        {/* Orange top bar */}
        <div className="h-1.5 bg-gradient-to-r from-[--color-orange-brand] to-[--color-orange-dark]" />

        <div className="p-7">
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[--color-orange-soft] text-[--color-orange-brand] text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[--color-orange-brand] animate-pulse" />
            Now in Beta
          </div>

          {/* Icon + headline */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-[--color-orange-soft] flex items-center justify-center shrink-0">
              <FileDown className="w-6 h-6 text-[--color-orange-brand]" />
            </div>
            <div>
              <h2 id="splash-title" className="text-xl font-display font-bold text-[--color-ink]">
                Save Estimates as PDF
              </h2>
              <p className="text-sm text-[--color-ink-dim] mt-1">
                Export any calculation as a professional PDF — great for bids, clients, and the job site.
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['Professional PDF export', 'AI material optimizer', 'Budget tracker', 'Saved estimates'].map(f => (
              <span key={f} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3 text-[--color-orange-brand]" />
                {f}
              </span>
            ))}
          </div>

          {/* Form or success */}
          {submitted ? (
            <div className="flex items-center justify-center gap-2 py-4 text-green-600 font-semibold">
              <Check className="w-5 h-5" />
              You&apos;re on the list!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {loading ? '…' : 'Get Access →'}
              </button>
            </form>
          )}

          <button onClick={dismiss} className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
            No thanks, just use the calculators
          </button>
        </div>
      </div>
    </>
  )
}
