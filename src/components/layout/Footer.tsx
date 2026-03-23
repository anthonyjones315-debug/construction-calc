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
    <footer className="border-t border-[--color-border] bg-[--color-surface-alt] text-sm text-[--color-ink-mid]">
      <div className="mx-auto flex h-7 max-w-7xl items-center justify-between gap-2 px-3 overflow-hidden">
        <div className="flex min-w-0 items-center gap-2 text-[10px] text-[--color-ink-dim]">
          <HardHat className="h-3 w-3 shrink-0 text-blue-600" aria-hidden />
          <span className="truncate font-display font-bold uppercase tracking-[0.12em] text-[--color-ink-mid]">
            {BUSINESS_NAME}
          </span>
          <span className="hidden text-[--color-ink-dim] lg:inline">
            © {COPYRIGHT_YEAR}
          </span>
        </div>
        <div className="flex items-center gap-x-3 text-[9px] uppercase tracking-[0.12em] text-[--color-ink-dim]">
          <Link href={routes.privacy} prefetch={false} className="transition-colors hover:text-[--color-blue-brand]">
            Privacy
          </Link>
          <Link href={routes.terms} prefetch={false} className="transition-colors hover:text-[--color-blue-brand]">
            Terms
          </Link>
          <a
            href={`mailto:${BUSINESS_EMAIL}`}
            className="transition-colors hover:text-[--color-blue-brand]"
          >
            Contact
          </a>
          <CookiePreferencesButton />
        </div>
      </div>
    </footer>
  );
}
