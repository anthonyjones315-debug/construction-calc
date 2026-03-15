"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  HardHat,
  User,
  LogOut,
  ChevronDown,
  Bookmark,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { primaryNavigation, routes } from "@routes";

export function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const displayName = session?.user?.name ?? "Anthony Jones";
  const businessStatus = session?.user ? "Business Active" : "Business Guest";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F0F10]/95 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between gap-4 px-4">
        {/* Logo — P brand: always to Command Center dashboard */}
        <Link
          href={routes.commandCenter}
          className="flex shrink-0 items-center gap-2 text-xl font-display font-black tracking-wide text-white transition-colors hover:text-[#FF8C00]"
          aria-label="Pro Construction Calc - Command Center"
        >
          <HardHat className="w-6 h-6 text-[#FF8C00]" aria-hidden />
          <span className="hidden sm:block">Pro Construction Calc</span>
          <span className="sm:hidden">PC</span>
          <span className="ml-1 rounded bg-[#FF8C00] px-1.5 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider text-black">
            Beta
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-6 text-sm text-white/70 md:flex"
          aria-label="Main navigation"
        >
          {primaryNavigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side: auth + mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Auth area */}
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 text-sm text-[--color-nav-text] transition-colors hover:text-white"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-controls="account-menu"
                aria-label="Account menu"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={`${session.user?.name ?? "User"} profile picture`}
                    className="w-7 h-7 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[--color-orange-brand] flex items-center justify-center">
                    <User className="w-4 h-4 text-black" aria-hidden />
                  </div>
                )}
                <span className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
                  <span className="text-xs font-semibold text-white">{displayName}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[--color-orange-brand]">
                    {businessStatus}
                  </span>
                </span>
                <ChevronDown className="w-3 h-3" aria-hidden />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden
                  />
                  <div
                    id="account-menu"
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border trim-nav-border bg-[#111826] shadow-[0_18px_40px_rgba(0,0,0,0.42)]"
                    role="menu"
                    aria-label="Account menu"
                  >
                    <div className="border-b trim-nav-border px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-[--color-nav-text]/55">
                        Signed in as
                      </p>
                      <p className="truncate text-sm font-medium text-white">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href={routes.saved}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[--color-nav-text] transition-colors hover:bg-white/6 hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Bookmark className="w-4 h-4" aria-hidden />
                      Saved Estimates
                    </Link>
                    <Link
                      href={routes.pricebook}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[--color-nav-text] transition-colors hover:bg-white/6 hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="w-4 h-4 text-center" aria-hidden>
                        📋
                      </span>
                      Price Book
                    </Link>
                    <Link
                      href={routes.settings}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[--color-nav-text] transition-colors hover:bg-white/6 hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="w-4 h-4 text-center" aria-hidden>
                        ⚙️
                      </span>
                      Business Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" aria-hidden />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href={routes.auth.signIn}
              className="rounded-lg bg-[#FF8C00] px-4 py-1.5 text-sm font-black uppercase text-black transition-colors hover:brightness-95"
              aria-label="Sign in to your Estimating Cockpit"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? (
              <X className="w-5 h-5" aria-hidden />
            ) : (
              <Menu className="w-5 h-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileNavOpen && (
        <nav
          id="mobile-navigation"
          className="flex flex-col gap-1 border-t border-white/10 bg-[#0F0F10] px-4 py-3 md:hidden"
          aria-label="Mobile navigation"
        >
          {primaryNavigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
