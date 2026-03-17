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
    <footer className="border-t border-slate-800 bg-slate-950 text-sm text-slate-300">
      <div className="mx-auto flex min-h-[--shell-footer-h] max-w-7xl flex-col justify-center gap-2 px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-slate-400">
          <HardHat className="h-3.5 w-3.5 shrink-0 text-orange-500" aria-hidden />
          <span className="truncate font-display font-black uppercase tracking-[0.14em] text-slate-200">
            {BUSINESS_NAME}
          </span>
          <span className="hidden text-slate-500 sm:inline">
            {BUSINESS_CITY_STATE}
          </span>
          <span className="hidden text-slate-500 lg:inline">
            © {COPYRIGHT_YEAR}
          </span>
        </div>

        <p className="hidden max-w-xl text-center text-[10px] leading-relaxed text-slate-500 xl:block">
          Built for contractors working across Oneida, Herkimer, and Madison County. Verify quantities, site conditions, and local code before ordering or building.
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
          <Link href={routes.calculators} prefetch={false} className="transition-colors hover:text-white">
            Calculators
          </Link>
          <Link href={routes.commandCenter} prefetch={false} className="transition-colors hover:text-white">
            Command Center
          </Link>
          <Link href={routes.fieldNotes} prefetch={false} className="transition-colors hover:text-white">
            Field Notes
          </Link>
          <Link href={routes.guide} prefetch={false} className="transition-colors hover:text-white">
            Guide
          </Link>
          <Link href={routes.privacy} prefetch={false} className="transition-colors hover:text-white">
            Privacy
          </Link>
          <Link href={routes.terms} prefetch={false} className="transition-colors hover:text-white">
            Terms
          </Link>
          <a
            href={`mailto:${BUSINESS_EMAIL}`}
            className="transition-colors hover:text-white"
          >
            Contact
          </a>
          <CookiePreferencesButton />
        </div>
      </div>
    </footer>
  );
}
