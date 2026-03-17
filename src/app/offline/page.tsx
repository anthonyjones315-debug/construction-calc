import Link from "next/link";
import { WifiOff, Calculator } from "lucide-react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Offline | Pro Construction Calc",
  "Offline fallback page for Pro Construction Calc.",
);

export default function OfflinePage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="dark-feature-panel w-full max-w-sm p-8 text-center text-white">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/6">
          <WifiOff className="w-8 h-8 text-[--color-orange-brand]" />
        </div>
        <h1 className="mb-2 text-2xl font-display font-bold text-white">
          You&apos;re offline
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[--color-nav-text]/72">
          No internet connection. Any calculators you've already opened are
          available below — your inputs are saved.
        </p>
        <Link
          href="/calculators"
          className="inline-flex items-center gap-2 rounded-xl bg-[--color-orange-brand] px-6 py-3 font-bold text-white transition hover:bg-[--color-orange-dark]"
        >
          <Calculator className="w-4 h-4" aria-hidden />
          Open Calculators
        </Link>
      </div>
    </div>
  );
}
