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

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
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
              className="block w-full px-4 py-2.5 bg-orange-brand hover:bg-orange-dark text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Open Calculators
            </Link>
            <Link
              href={routes.home}
              className="block w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
