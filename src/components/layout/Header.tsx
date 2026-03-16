"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  HardHat,
  User,
  LogOut,
  ChevronDown,
  Bookmark,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { primaryNavigation, routes } from "@routes";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCommandCenterActive =
    pathname === "/command-center" || pathname === "/dashboard";

  const online = useOnlineStatus();
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
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between gap-1 px-4 sm:gap-4">
        {/* Logo — P brand: always to Command Center dashboard */}
            <Link
              href={routes.commandCenter}
              className="flex shrink-0 items-center gap-2 text-base font-display font-black tracking-wide text-white transition-colors hover:text-orange-500 sm:text-xl"
              aria-label="Pro Construction Calc - Command Center"
            >
              <HardHat className="w-6 h-6 text-orange-500" aria-hidden />
          <span className="hidden sm:block">Pro Construction Calc</span>
          <span className="sm:hidden">PC</span>
          <span className="ml-1 hidden rounded bg-orange-600 px-1.5 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider text-white sm:inline">
            Beta
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-4 text-sm text-slate-300 md:flex"
          aria-label="Main navigation"
        >
          {primaryNavigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-11 items-center rounded-lg px-3 py-1.5 text-sm transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side: offline badge + auth + mobile hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hydration-safe offline badge: render a placeholder until mounted. */}
          <span
            className={`rounded-full border border-slate-600 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${
              isMounted && !online ? "" : "invisible"
            }`}
            aria-live="polite"
            aria-hidden={!(isMounted && !online)}
          >
            Offline
          </span>
          {/* Auth area */}
          {!isMounted ? (
            <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />
          ) : status === "loading" ? (
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
                  <span className="text-xs font-semibold text-slate-100">{displayName}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-orange-600">
                    {businessLabel}
                  </span>
                </span>
                <ChevronDown className="w-3 h-3" aria-hidden />
              </button>

              {menuOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.42)]"
                  role="menu"
                  aria-label="Account menu"
                >
                  <div className="border-b border-slate-800 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-medium text-slate-100">
                      {session.user?.email}
                    </p>
                  </div>
                  <Link
                    href={routes.commandCenter}
                    role="menuitem"
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-slate-800 hover:text-orange-500 ${
                      isCommandCenterActive
                        ? "text-orange-600 font-bold"
                        : "text-slate-200"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard
                      className={`h-4 w-4 shrink-0 ${
                        isCommandCenterActive ? "text-orange-600" : "text-slate-300"
                      }`}
                      aria-hidden
                    />
                    Command Center
                  </Link>
                  <Link
                    href={routes.saved}
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Bookmark className="w-4 h-4 text-slate-300" aria-hidden />
                    Saved Estimates
                  </Link>
                  <Link
                    href={routes.pricebook}
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="w-4 h-4 text-center text-slate-300" aria-hidden>
                      📋
                    </span>
                    Price Book
                  </Link>
                  <Link
                    href={routes.settings}
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="w-4 h-4 text-center text-slate-300" aria-hidden>
                      ⚙️
                    </span>
                    Business Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 text-red-300" aria-hidden />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={routes.auth.signIn}
              className="btn-tactile flex min-h-11 items-center rounded-lg bg-orange-600 px-4 text-sm font-black uppercase text-white transition-all duration-200 hover:bg-orange-700 active:scale-[0.98]"
              aria-label="Sign in to your Estimating Cockpit"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn-tactile flex h-11 min-h-11 w-11 items-center justify-center rounded-lg text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-[0.98] md:hidden"
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
          className="flex flex-col gap-1 border-t border-slate-800 bg-slate-900 px-4 py-3 md:hidden"
          aria-label="Mobile navigation"
        >
          {session && (
            <Link
              href={routes.commandCenter}
              onClick={() => setMobileNavOpen(false)}
              className={`flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-slate-800 hover:text-orange-500 ${
                isCommandCenterActive
                  ? "text-orange-600 font-bold"
                  : "text-slate-200"
              }`}
            >
              <LayoutDashboard
                className={`h-4 w-4 shrink-0 ${
                  isCommandCenterActive ? "text-orange-600" : "text-slate-300"
                }`}
                aria-hidden
              />
              Command Center
            </Link>
          )}
          {primaryNavigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
