import Link from "next/link";
import { HardHat } from "lucide-react";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";
import { routes } from "@routes";
import {
  BUSINESS_CITY_STATE,
  BUSINESS_EMAIL,
  BUSINESS_NAME,
} from "@/lib/business-identity";

const COPYRIGHT_YEAR = 2026;

export function Footer() {
  return (
    <footer className="site-footer-shell safe-area-pb text-sm">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
        <div className="grid min-h-[--shell-footer-h] gap-4 md:grid-cols-[minmax(0,auto)_minmax(0,1fr)] md:items-center xl:grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)]">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[--color-ink-mid]">
            <HardHat className="h-3.5 w-3.5 shrink-0 text-[--color-orange-brand]" aria-hidden />
            <span className="font-display font-black uppercase tracking-[0.14em] text-[--color-ink] sm:whitespace-nowrap">
              {BUSINESS_NAME}
            </span>
            <span className="text-[--color-ink-dim] sm:whitespace-nowrap">
              {BUSINESS_CITY_STATE}
            </span>
            <span className="text-[--color-ink-dim] sm:whitespace-nowrap">
              © {COPYRIGHT_YEAR} · v0.1 Beta
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-[--color-ink-dim] md:col-span-2 md:max-w-none md:text-center xl:col-span-1 xl:max-w-xl xl:justify-self-center">
            Built for contractors working across Oneida, Herkimer, and Madison County. Verify quantities, site conditions, and local code before ordering or building.
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-[--color-ink-mid] md:justify-end">
            <Link href={routes.calculators} prefetch={false} className="transition-colors hover:text-[--color-orange-brand]">
              Calculators
            </Link>
            <Link href={routes.commandCenter} prefetch={false} className="transition-colors hover:text-[--color-orange-brand]">
              Command Center
            </Link>
            <Link href={routes.fieldNotes} prefetch={false} className="transition-colors hover:text-[--color-orange-brand]">
              Field Notes
            </Link>
            <Link href={routes.guide} prefetch={false} className="transition-colors hover:text-[--color-orange-brand]">
              Guide
            </Link>
            <Link href={routes.privacy} prefetch={false} className="transition-colors hover:text-[--color-orange-brand]">
              Privacy
            </Link>
            <Link href={routes.terms} prefetch={false} className="transition-colors hover:text-[--color-orange-brand]">
              Terms
            </Link>
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              className="transition-colors hover:text-[--color-orange-brand]"
            >
              Contact
            </a>
            <CookiePreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
