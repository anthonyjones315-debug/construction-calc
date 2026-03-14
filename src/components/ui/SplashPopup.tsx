'use client'
import { useState, useEffect } from 'react'
import { X, FileDown } from 'lucide-react'

const STORAGE_KEY = 'bcp_beta_splash_v3'
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/

export function SplashPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const timer = setTimeout(() => setShow(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch { /* private browsing */ }
  }, [])

  function dismiss() {
    setShow(false)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ok */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/leads/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'splash_popup' }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Signup failed')
      }

      setStatus('done')
      setTimeout(dismiss, 1800)
    } catch {
      setStatus('error')
      setError('Something went wrong. Please try again.')
    }
  }

  if (!show) return null

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
        aria-modal="true"
        aria-labelledby="splash-title"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        style={{ animation: 'splashUp 0.25s ease forwards' }}
      >
        <div className="bg-[--color-surface] rounded-2xl shadow-2xl p-6 relative">
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-lg text-[--color-ink-dim] hover:text-[--color-ink] hover:bg-[--color-surface-alt] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[--color-orange-soft] flex items-center justify-center">
              <FileDown className="w-5 h-5 text-[--color-orange-brand]" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-orange-brand]">Now in Beta</p>
              <h2 id="splash-title" className="text-lg font-display font-bold text-[--color-ink]">Save Estimates as PDF</h2>
            </div>
          </div>

          <p className="text-sm text-[--color-ink-dim] mb-4 leading-relaxed">
            Export any calculation as a professional PDF — great for bids, clients, and the job site.
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {['Professional PDF export', 'AI material optimizer', 'Budget tracker', 'Saved estimates'].map(f => (
              <span key={f} className="flex items-center gap-1 text-xs bg-[--color-surface-alt] border border-gray-200 text-[--color-ink-mid] px-2.5 py-1 rounded-full">
                <span className="text-[--color-orange-brand]">✓</span> {f}
              </span>
            ))}
          </div>

          {status === 'done' ? (
            <p className="text-center text-sm font-medium text-green-600 py-2">
              ✓ You&apos;re on the list! Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-sm text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
                  aria-label="Email address"
                  autoComplete="email"
                  maxLength={320}
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-4 py-2.5 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {status === 'loading' ? '…' : 'Notify Me'}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
              <p className="text-[10px] text-[--color-ink-dim] mt-2 text-center">
                No spam. Unsubscribe any time.
              </p>
            </form>
          )}

          <button
            onClick={dismiss}
            className="w-full mt-3 text-xs text-[--color-ink-dim] hover:text-[--color-ink] transition-colors min-h-[44px] rounded-xl hover:bg-[--color-surface-alt] cursor-pointer"
          >
            No thanks, just use the calculators
          </button>
        </div>
      </div>
    </>
  )
}
