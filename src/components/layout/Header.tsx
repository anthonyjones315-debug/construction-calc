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
import { useState, useRef, useEffect } from "react";
import { primaryNavigation, routes } from "@routes";

export function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = session?.user?.name ?? "User";
  const businessLabel =
    session?.user && businessName !== undefined
      ? (businessName?.trim() || "Pro Account")
      : "Guest";

  useEffect(() => {
    let cancelled = false;

    const loadBusinessName = async () => {
      if (!session?.user?.id) {
        setBusinessName(null);
        return;
      }

      try {
        const res = await fetch("/api/business-profile");
        if (cancelled) return;
        if (!res.ok) {
          setBusinessName(null);
          return;
        }

        const data: { profile?: { business_name?: string | null } } | null =
          await res.json();
        if (cancelled || !data?.profile) return;

        const name =
          typeof data.profile.business_name === "string"
            ? data.profile.business_name.trim()
            : null;
        setBusinessName(name);
      } catch {
        if (!cancelled) {
          setBusinessName(null);
        }
      }
    };

    loadBusinessName();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between gap-4 px-4">
        {/* Logo — P brand: always to Command Center dashboard */}
            <Link
              href={routes.commandCenter}
              className="flex shrink-0 items-center gap-2 text-xl font-display font-black tracking-wide text-white transition-colors hover:text-orange-500"
              aria-label="Pro Construction Calc - Command Center"
            >
              <HardHat className="w-6 h-6 text-orange-500" aria-hidden />
          <span className="hidden sm:block">Pro Construction Calc</span>
          <span className="sm:hidden">PC</span>
          <span className="ml-1 rounded bg-orange-600 px-1.5 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider text-white">
            Beta
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-6 text-sm text-slate-300 md:flex"
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
            <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
          ) : session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
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
                  <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" aria-hidden />
                  </div>
                )}
                <span className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
                  <span className="text-xs font-semibold text-white">{displayName}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-orange-500">
                    {businessLabel}
                  </span>
                </span>
                <ChevronDown className="w-3 h-3" aria-hidden />
              </button>

              {menuOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-[0_18px_40px_rgba(0,0,0,0.42)]"
                    role="menu"
                    aria-label="Account menu"
                  >
                    <div className="border-b border-slate-800 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        Signed in as
                      </p>
                      <p className="truncate text-sm font-medium text-white">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href={routes.saved}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Bookmark className="w-4 h-4" aria-hidden />
                      Saved Estimates
                    </Link>
                    <Link
                      href={routes.pricebook}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
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
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
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
              )}
            </div>
          ) : (
            <Link
              href={routes.auth.signIn}
              className="rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-black uppercase text-white transition-colors hover:bg-orange-700"
              aria-label="Sign in to your Estimating Cockpit"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
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
          className="flex flex-col gap-1 border-t border-slate-800 bg-slate-950 px-4 py-3 md:hidden"
          aria-label="Mobile navigation"
        >
          {primaryNavigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
