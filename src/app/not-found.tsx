import Link from "next/link";
import type { Metadata } from "next";
import { routes } from "@routes";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-bg] px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[--color-orange-brand] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">P</span>
          </div>
          <span className="text-[--color-ink] font-display font-bold text-xl tracking-wide">
            Pro Construction Calc
          </span>
        </div>

        <div className="rounded-2xl border border-[--color-border] bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-colors">
          <div className="text-7xl font-display font-black text-[--color-orange-brand] mb-4">
            404
          </div>
          <h1 className="text-[--color-ink] font-semibold text-xl mb-2">
            Page not found
          </h1>
          <p className="mb-6 text-sm text-[--color-ink-dim]">
            That page doesn&apos;t exist. It may have been moved or the link is
            incorrect.
          </p>
          <div className="space-y-3">
            <Link
              href={routes.calculators}
              className="btn-tactile flex min-h-11 w-full items-center justify-center bg-[--color-orange-brand] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[--color-orange-dark] active:scale-[0.98] rounded-lg"
            >
              Open Calculators
            </Link>
            <Link
              href={routes.home}
              className="btn-tactile flex min-h-11 w-full items-center justify-center rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-4 py-2.5 text-sm font-medium text-[--color-ink-mid] transition-all duration-200 hover:border-[--color-orange-brand]/30 hover:bg-[--color-orange-soft] active:scale-[0.98]"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
