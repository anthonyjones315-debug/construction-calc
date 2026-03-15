import Link from "next/link";
import type { Metadata } from "next";
import { routes } from "@routes";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-orange-brand rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">P</span>
          </div>
          <span className="text-white font-display font-bold text-xl tracking-wide">
            Pro Construction Calc
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-[0_24px_50px_rgba(0,0,0,0.45)] transition-colors">
          <div className="text-7xl font-display font-black text-orange-brand mb-4">
            404
          </div>
          <h1 className="text-white font-semibold text-xl mb-2">
            Page not found
          </h1>
          <p className="mb-6 text-sm text-slate-400">
            That page doesn&apos;t exist. It may have been moved or the link is
            incorrect.
          </p>
          <div className="space-y-3">
            <Link
              href={routes.calculators}
              className="btn-tactile flex min-h-11 w-full items-center justify-center bg-orange-brand px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-dark active:scale-[0.98] rounded-lg"
            >
              Open Calculators
            </Link>
            <Link
              href={routes.home}
              className="btn-tactile flex min-h-11 w-full items-center justify-center rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-700 active:scale-[0.98]"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
