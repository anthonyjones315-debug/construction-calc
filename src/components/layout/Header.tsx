"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  HardHat,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { primaryNavigation, routes } from "@routes";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cartCount = useStore((s) => s.estimateCart.length);

  const online = useOnlineStatus();
  const isCommandCenterActive =
    pathname === "/command-center" || pathname === "/dashboard";
  const commandCenterHref = session ? routes.commandCenter : routes.auth.signIn;
  const brandHref = session ? routes.commandCenter : routes.home;

  const userDisplayName =
    session?.user?.name?.trim() || session?.user?.email?.trim() || "Pro User";
  const userInitials = userDisplayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "AJ";

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

        const data:
          | { profile?: { business_name?: string | null; company_name?: string | null } }
          | null =
          await res.json();
        if (cancelled || !data?.profile) return;

        const name =
          typeof data.profile.company_name === "string"
            ? data.profile.company_name.trim()
            : typeof data.profile.business_name === "string"
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

  const closeAccountMenu = useCallback(() => setMenuOpen(false), []);
  const closeMobileMenu = useCallback(() => setMobileNavOpen(false), []);
  useClickOutside(menuRef, closeAccountMenu, menuOpen);
  useClickOutside(headerRef, closeMobileMenu, mobileNavOpen);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (headerRef.current?.contains(e.target as Node)) return;
      setMobileNavOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [mobileNavOpen]);

  return (
    <header ref={headerRef} className="site-header-shell sticky top-0 z-50">
      <div className="mx-auto flex h-[--shell-header-h] max-w-7xl items-center justify-between gap-1 px-2.5 sm:gap-2 sm:px-3">
        {/* Logo — P brand: always to Command Center dashboard */}
        <Link
          href={brandHref}
          prefetch={false}
          className="flex shrink-0 items-center gap-1 text-xs font-display font-black tracking-wide text-copy-primary transition-colors hover:text-primary sm:text-base"
          aria-label="Pro Construction Calc - Command Center"
        >
          <HardHat className="h-4 w-4 text-orange-500 sm:h-[18px] sm:w-[18px]" aria-hidden />
          <span className="hidden sm:block">Pro Construction Calc</span>
          <span className="sm:hidden">PC</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="site-header-nav hidden items-center gap-2 text-sm md:flex"
          aria-label="Main navigation"
        >
          {primaryNavigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className="flex min-h-7 items-center rounded-lg px-2 py-1 text-[11px] transition-colors hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side: command shortcut + offline badge + auth + mobile hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {/* Mobile-friendly quick jump into Command Center */}
          <Link
            href={commandCenterHref}
            prefetch={false}
            className={`inline-flex h-7 min-w-[84px] items-center justify-center rounded-full border px-2 text-[9px] font-black uppercase tracking-[0.16em] ${
              isCommandCenterActive
                ? "border-orange-500 bg-orange-600/20 text-orange-300"
                : "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-orange-500 hover:text-orange-300"
            } hidden xs:inline-flex sm:hidden`}
              aria-label="Open Command Center dashboard"
          >
            <LayoutDashboard className="mr-1 h-3 w-3" aria-hidden />
            Command
          </Link>
          {/* Cart quick access: always visible so batch estimate workflows stay one tap away. */}
          <Link
            href={routes.cart}
            prefetch={false}
            className="inline-flex min-h-7 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-copy-primary transition hover:border-orange-400/60 hover:text-primary sm:px-2.5"
            aria-label={`Cart ${cartCount} item${cartCount === 1 ? "" : "s"}`}
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Cart</span>
            <span className="rounded-full bg-orange-500 px-1.5 py-[2px] text-[9px] font-black text-white">
              {cartCount}
            </span>
          </Link>
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
            <div className="h-7 w-7 rounded-full bg-slate-800 animate-pulse" />
          ) : status === "loading" ? (
            <div className="h-7 w-7 rounded-full bg-slate-700 animate-pulse" />
          ) : session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-1 rounded-full text-sm text-copy-secondary transition-colors hover:text-copy-primary"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-controls="account-menu"
                aria-label="Account menu"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={`${session.user?.name ?? "User"} profile picture`}
                    className="h-7 w-7 rounded-full border border-slate-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[--color-orange-brand] text-[10px] font-display font-black tracking-wide text-white">
                    {userInitials}
                  </div>
                )}
                <ChevronDown className="h-2.5 w-2.5" aria-hidden />
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
                      {businessName?.trim() || session.user?.name || "Pro Account"}
                    </p>
                    <p className="truncate text-xs text-slate-400">{session.user?.email}</p>
                  </div>
                  <Link
                    href={routes.settings}
                    prefetch={false}
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="w-4 text-center text-slate-300" aria-hidden>
                      ⚙
                    </span>
                    Business Profile
                  </Link>
                  <Link
                    href={routes.commandCenter}
                    prefetch={false}
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="w-4 text-center text-slate-300" aria-hidden>
                      🏠
                    </span>
                    Command Center
                  </Link>
                  <Link
                    href={routes.saved}
                    prefetch={false}
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="w-4 text-center text-slate-300" aria-hidden>
                      ▣
                    </span>
                    My Estimates
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
              prefetch={false}
              className="btn-tactile flex min-h-7 items-center rounded-lg bg-orange-700 px-2.5 text-[11px] font-black uppercase text-white transition-all duration-200 hover:bg-orange-800 active:scale-[0.98]"
              aria-label="Sign in to your Estimating Cockpit"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn-tactile flex h-8 min-h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-[0.98] md:hidden"
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
          className="flex flex-col gap-1 border-t border-slate-800 bg-slate-900 px-4 py-2 md:hidden"
          aria-label="Mobile navigation"
        >
          {session && (
            <Link
              href={routes.commandCenter}
              prefetch={false}
              onClick={() => setMobileNavOpen(false)}
              className={`flex min-h-9 items-center gap-2 rounded-lg px-4 py-1.5 text-sm transition-colors hover:bg-slate-800 hover:text-orange-500 ${
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
              prefetch={false}
              onClick={() => setMobileNavOpen(false)}
              className="flex min-h-9 items-center rounded-lg px-4 py-1.5 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
            >
              {label}
            </Link>
          ))}
          <Link
            href={routes.cart}
            prefetch={false}
            onClick={() => setMobileNavOpen(false)}
            className="flex min-h-9 items-center rounded-lg px-4 py-1.5 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-orange-500"
          >
            <ShoppingCart className="h-4 w-4 mr-2 text-slate-300" aria-hidden />
            Cart ({cartCount})
          </Link>
        </nav>
      )}
    </header>
  );
}
