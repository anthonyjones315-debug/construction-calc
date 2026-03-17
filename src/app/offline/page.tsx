import Link from "next/link";
import { WifiOff, Calculator, FileText, BookOpenCheck } from "lucide-react";
import { getNoIndexMetadata } from "@/seo";
import { routes } from "@routes";

export const metadata = getNoIndexMetadata(
  "Offline | Pro Construction Calc",
  "Offline fallback page for Pro Construction Calc.",
);

export default function OfflinePage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="dark-feature-panel w-full max-w-lg p-8 text-center text-white">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/6">
          <WifiOff className="w-8 h-8 text-[--color-orange-brand]" />
        </div>
        <h1 className="mb-2 text-2xl font-display font-bold text-white">
          You&apos;re offline
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[--color-nav-text]/72">
          No internet connection right now. Keep moving with cached pages,
          already-open calculators, and saved field inputs while the signal comes back.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href={routes.calculators}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-5 py-3 font-bold text-white transition hover:bg-[--color-orange-dark]"
          >
            <Calculator className="w-4 h-4" aria-hidden />
            Calculators
          </Link>
          <Link
            href={routes.saved}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-orange-400/60"
          >
            <FileText className="w-4 h-4" aria-hidden />
            Saved
          </Link>
          <Link
            href={routes.guide}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-orange-400/60"
          >
            <BookOpenCheck className="w-4 h-4" aria-hidden />
            Guide
          </Link>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs leading-relaxed text-slate-300">
          Best use in the field:
          keep the calculator you need open before you lose service, then return
          to Command Center or Saved Estimates when signal comes back.
        </div>
      </div>
    </div>
  );
}
