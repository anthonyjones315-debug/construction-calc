'use client'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { HardHat, User, LogOut, ChevronDown, Bookmark, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[--color-nav-bg] border-b border-white/10 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white font-display font-bold text-xl tracking-wide hover:text-[--color-nav-active] transition-colors shrink-0"
          aria-label="Build Calc Pro — Home"
        >
          <HardHat className="w-6 h-6 text-[--color-orange-brand]" aria-hidden />
          <span className="hidden sm:block">BUILD CALC PRO</span>
          <span className="sm:hidden">BCP</span>
          <span className="text-[10px] font-sans font-bold bg-[--color-orange-brand] text-white px-1.5 py-0.5 rounded uppercase tracking-wider ml-1">Beta</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-[--color-nav-text]" aria-label="Main navigation">
          <Link href="/calculators" className="hover:text-[#f9fafb] transition-colors">Calculators</Link>
          <Link href="/blog"        className="hover:text-[#f9fafb] transition-colors">Blog</Link>
          <Link href="/faq"         className="hover:text-[#f9fafb] transition-colors">FAQ</Link>
          <Link href="/about"       className="hover:text-[#f9fafb] transition-colors">About</Link>
        </nav>

        {/* Right side: auth + mobile hamburger */}
        <div className="flex items-center gap-3">

          {/* Auth area */}
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-[--color-nav-text] hover:text-[#f9fafb] transition-colors"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={`${session.user?.name ?? 'User'} profile picture`}
                    className="w-7 h-7 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[--color-orange-brand] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" aria-hidden />
                  </div>
                )}
                <span className="hidden sm:block">{session.user?.name?.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3" aria-hidden />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{session.user?.email}</p>
                    </div>
                    <Link href="/saved" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                      <Bookmark className="w-4 h-4" aria-hidden />
                      Saved Estimates
                    </Link>
                    <Link href="/pricebook" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                      <span className="w-4 h-4 text-center" aria-hidden>📋</span>
                      Price Book
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                      <span className="w-4 h-4 text-center" aria-hidden>⚙️</span>
                      Business Profile
                    </Link>
                    <button
                      onClick={() => { signOut(); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="text-sm font-medium bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white px-4 py-1.5 rounded-lg transition-colors"
              aria-label="Sign in to your account"
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[--color-nav-text] hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileNavOpen(o => !o)}
            aria-expanded={mobileNavOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileNavOpen && (
        <nav
          className="md:hidden border-t border-white/10 bg-[--color-nav-bg] px-4 py-3 flex flex-col gap-1"
          aria-label="Mobile navigation"
        >
          {[
            { href: '/calculators', label: 'Calculators' },
            { href: '/blog',        label: 'Blog' },
            { href: '/faq',         label: 'FAQ' },
            { href: '/about',       label: 'About' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              className="text-sm text-[--color-nav-text] hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
