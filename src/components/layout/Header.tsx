"use client";
import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import {
  LayoutDashboard,
  Menu,
  X,
  ClipboardList,
  Settings,
  Building2,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { primaryNavigation, routes } from "@routes";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useStore } from "@/lib/store";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const estimateCount = useStore((s) => s.estimateCart.length);

  const online = useOnlineStatus();
  const isCommandCenterActive =
    pathname === "/command-center" || pathname === "/dashboard";
  const commandCenterHref = session ? routes.commandCenter : routes.auth.signIn;
  const brandHref = session ? routes.commandCenter : routes.home;

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

        const data: {
          profile?: {
            business_name?: string | null;
            company_name?: string | null;
          };
        } | null = await res.json();
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

  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setLoadingTimedOut(true), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  const closeMobileMenu = useCallback(() => setMobileNavOpen(false), []);
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
    <header ref={headerRef} className="site-header-shell sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-[var(--shell-header-h)] min-w-0 max-w-7xl items-center justify-between gap-1 px-4 sm:gap-2 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={brandHref}
          prefetch={false}
          className="flex shrink-0 items-center gap-1 text-xs font-display font-black tracking-wide text-slate-900 transition-colors hover:text-[--color-blue-brand] sm:text-base"
          aria-label="Pro Construction Calc - Command Center"
        >
          <Image
            src="/images/app-logo-transparent.png"
            alt="Pro Construction Calc"
            width={24}
            height={24}
            className="h-6 w-6 sm:h-8 sm:w-8 mr-2 drop-shadow-sm object-contain"
          />
          <span className="hidden sm:block">Pro Construction Calc</span>
          <span className="sm:hidden">ProCalc</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="site-header-nav hidden items-center gap-2 text-sm md:flex"
          aria-label="Main navigation"
        >
          {primaryNavigation.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return isActive ? (
              <span
                key={label}
                className="flex min-h-7 items-center rounded-lg px-2 py-1 text-xs font-semibold text-blue-brand underline underline-offset-4 decoration-[--color-blue-rim]"
                aria-current="page"
              >
                {label}
              </span>
            ) : (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className="flex min-h-7 items-center rounded-lg px-2 py-1 text-xs text-slate-600 transition-colors hover:text-[--color-blue-brand]"
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
          {/* Command Center quick link */}
          <Link
            href={commandCenterHref}
            prefetch={false}
            className={`inline-flex h-7 min-w-[84px] items-center justify-center rounded-full border px-2 text-[9px] font-black uppercase tracking-[0.16em] ${
              isCommandCenterActive
                ? "border-[--color-blue-brand]/45 bg-[--color-blue-soft] text-[--color-blue-dark]"
                : "border-slate-300 bg-white text-slate-700 hover:border-[--color-blue-brand]/45 hover:text-[--color-blue-brand]"
            } hidden xs:inline-flex sm:hidden`}
            aria-label="Open Command Center dashboard"
          >
            <LayoutDashboard className="mr-1 h-3 w-3" aria-hidden />
            Command
          </Link>

          {/* Estimate queue */}
          <Link
            href={routes.cart}
            prefetch={false}
            className="inline-flex min-h-7 items-center gap-1 rounded-full border border-slate-300 bg-white px-1.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-[--color-blue-brand]/45 hover:text-[--color-blue-brand] sm:px-2.5"
            aria-label={`Estimate queue ${estimateCount} item${estimateCount === 1 ? "" : "s"}`}
          >
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Estimates</span>
            {estimateCount > 0 && (
              <span className="rounded-full bg-blue-brand px-1.5 py-[2px] text-[9px] font-black text-white">
                {estimateCount}
              </span>
            )}
          </Link>

          {/* Offline badge */}
          <span
            className={`hidden rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:inline-flex ${
              isMounted && !online ? "" : "invisible"
            }`}
            aria-live="polite"
            aria-hidden={!(isMounted && !online)}
          >
            Offline
          </span>

          {/* Auth area */}
          {!isMounted ? (
            <div className="h-7 w-7 rounded-full bg-slate-200 animate-pulse" />
          ) : status === "loading" && !loadingTimedOut ? (
            <div className="h-7 w-7 rounded-full bg-slate-200 animate-pulse" />
          ) : status === "loading" && loadingTimedOut ? (
            <Link
              href={routes.auth.signIn}
              className="btn-tactile flex min-h-7 items-center rounded-lg bg-blue-brand px-2 text-[10px] font-black uppercase text-white transition-all duration-200 hover:bg-[--color-blue-dark] active:scale-[0.98] sm:px-2.5 sm:text-[11px]"
            >
              Sign In
            </Link>
          ) : session ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                  userButtonPopoverCard: "rounded-2xl",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  href={routes.settings}
                  label="Business Profile"
                  labelIcon={<Settings className="h-4 w-4" aria-hidden />}
                />
                <UserButton.Link
                  href={routes.commandCenter}
                  label="Command Center"
                  labelIcon={<Building2 className="h-4 w-4" aria-hidden />}
                />
                <UserButton.Link
                  href={routes.saved}
                  label="My Estimates"
                  labelIcon={<ClipboardList className="h-4 w-4" aria-hidden />}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <SignInButton
                mode="redirect"
                forceRedirectUrl={routes.commandCenter}
              >
                <button
                  type="button"
                  className="btn-tactile flex min-h-7 items-center rounded-lg bg-blue-brand px-2 text-[10px] font-black uppercase text-white transition-all duration-200 hover:bg-[--color-blue-dark] active:scale-[0.98] sm:px-2.5 sm:text-[11px]"
                  aria-label="Sign in to your Estimating Cockpit"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton
                mode="redirect"
                forceRedirectUrl={routes.commandCenter}
              >
                <button
                  type="button"
                  className="btn-tactile hidden min-h-7 items-center rounded-lg border border-slate-300 bg-white px-2 text-[10px] font-black uppercase text-slate-700 transition-all duration-200 hover:border-[--color-blue-brand]/45 hover:text-[--color-blue-brand] active:scale-[0.98] xs:inline-flex sm:px-2.5 sm:text-[11px]"
                  aria-label="Create an account"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn-tactile flex h-8 min-h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] md:hidden"
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
          className="flex flex-col gap-1 border-t-2 border-[--color-blue-brand] bg-white px-4 py-2 shadow-lg md:hidden"
          aria-label="Mobile navigation"
        >
          {session && businessName && (
            <div className="border-b border-slate-100 px-4 py-2 mb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Signed in</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{businessName}</p>
            </div>
          )}
          {session && (
            <Link
              href={routes.commandCenter}
              prefetch={false}
              onClick={() => setMobileNavOpen(false)}
              className={`flex min-h-10 items-center gap-2 rounded-lg px-4 py-1.5 text-sm transition-colors hover:bg-[--color-blue-soft] hover:text-[--color-blue-brand] ${
                isCommandCenterActive
                  ? "text-blue-brand font-bold"
                  : "text-slate-700"
              }`}
            >
              <LayoutDashboard
                className={`h-4 w-4 shrink-0 ${
                  isCommandCenterActive ? "text-blue-brand" : "text-slate-400"
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
              className="flex min-h-10 items-center rounded-lg px-4 py-1.5 text-sm text-slate-700 transition-colors hover:bg-[--color-blue-soft] hover:text-[--color-blue-brand]"
            >
              {label}
            </Link>
          ))}
          <Link
            href={routes.cart}
            prefetch={false}
            onClick={() => setMobileNavOpen(false)}
            className="flex min-h-10 items-center rounded-lg px-4 py-1.5 text-sm text-slate-700 transition-colors hover:bg-[--color-blue-soft] hover:text-[--color-blue-brand]"
          >
            <ClipboardList
              className="h-4 w-4 mr-2 text-slate-400"
              aria-hidden
            />
            Estimates ({estimateCount})
          </Link>
          {!session && (
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 px-2 pt-3">
              <SignInButton
                mode="redirect"
                forceRedirectUrl={routes.commandCenter}
              >
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="btn-tactile flex min-h-10 w-full items-center justify-center rounded-lg bg-blue-brand px-4 text-xs font-black uppercase text-white"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton
                mode="redirect"
                forceRedirectUrl={routes.commandCenter}
              >
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="btn-tactile flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-black uppercase text-slate-700"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
