'use client'
import { signIn } from 'next-auth/react'
import { HardHat, Chrome, Mail } from 'lucide-react'
import { useState } from 'react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    await signIn('resend', { email, redirect: false })
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[--color-bg] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[--color-nav-bg] mb-4 shadow-lg">
            <HardHat className="w-7 h-7 text-[--color-orange-brand]" />
          </div>
          <h1 className="text-2xl font-display font-bold text-[--color-ink]">Build Calc Pro</h1>
          <p className="text-sm text-[--color-ink-dim] mt-1">Sign in to save estimates and export PDFs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 space-y-3">
          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 text-[--color-ink] font-medium py-3 rounded-xl transition-all text-sm"
          >
            <Chrome className="w-4 h-4 text-blue-500" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or email</span>
            </div>
          </div>

          {/* Magic link */}
          {sent ? (
            <div className="text-center py-4">
              <Mail className="w-8 h-8 text-[--color-orange-brand] mx-auto mb-2" />
              <p className="text-sm font-medium text-[--color-ink]">Check your inbox</p>
              <p className="text-xs text-[--color-ink-dim] mt-1">We sent a sign-in link to {email}</p>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
              />
              <button
                type="submit"
                className="w-full bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                Send Magic Link
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[--color-ink-dim] mt-4">
          Free forever. No credit card. No spam.
        </p>
      </div>
    </div>
  )
}
