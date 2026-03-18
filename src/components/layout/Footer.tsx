import Link from "next/link";
import { HardHat } from "lucide-react";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";
import { routes } from "@routes";
import {
  BUSINESS_EMAIL,
  BUSINESS_NAME,
} from "@/lib/business-identity";

const COPYRIGHT_YEAR = 2026;

export function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950 text-sm text-slate-300">
      <div className="mx-auto flex h-7 max-w-7xl items-center justify-between gap-2 px-3 overflow-hidden">
        <div className="flex min-w-0 items-center gap-2 text-[10px] text-slate-500">
          <HardHat className="h-3 w-3 shrink-0 text-orange-500" aria-hidden />
          <span className="truncate font-display font-bold uppercase tracking-[0.12em] text-slate-400">
            {BUSINESS_NAME}
          </span>
          <span className="hidden text-slate-600 lg:inline">
            © {COPYRIGHT_YEAR}
          </span>
        </div>
        <div className="flex items-center gap-x-3 text-[9px] uppercase tracking-[0.12em] text-slate-600">
          <Link href={routes.privacy} prefetch={false} className="transition-colors hover:text-slate-400">
            Privacy
          </Link>
          <Link href={routes.terms} prefetch={false} className="transition-colors hover:text-slate-400">
            Terms
          </Link>
          <a
            href={`mailto:${BUSINESS_EMAIL}`}
            className="transition-colors hover:text-slate-400"
          >
            Contact
          </a>
          <CookiePreferencesButton />
        </div>
      </div>
    </footer>
  );
}
