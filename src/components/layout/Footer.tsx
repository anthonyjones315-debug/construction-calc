import Link from "next/link";
import { HardHat } from "lucide-react";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";
import {
  accountNavigation,
  getCalculatorCategoryHref,
  legalNavigation,
  routes,
} from "@routes";

const COPYRIGHT_YEAR = 2026;

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0F0F10] text-sm text-white/70">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3 flex items-center gap-2 text-lg font-display font-black uppercase text-white">
              <HardHat className="w-5 h-5 text-[#FF8C00]" aria-hidden />
              Pro Construction Calc
            </div>
            <p className="text-xs leading-relaxed text-white/65">
              Free professional construction calculators for contractors and
              serious DIYers. Based in Central New York.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/80">
              Pro Construction Calc · Rome, NY, USA
            </p>
            <div className="mt-4 inline-flex flex-col rounded-md border border-[#FF8C00]/60 bg-[#FF8C00]/10 px-3 py-2 text-white">
              <span className="font-display text-[11px] font-black uppercase tracking-[0.14em]">
                Built for the Field
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/70">
                Heavy-Duty Software
              </span>
            </div>
          </div>

          {/* Calculators */}
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/60">
              Calculators
            </p>
            <div className="space-y-2">
              {[
                {
                  href: getCalculatorCategoryHref("concrete"),
                  label: "Concrete",
                },
                {
                  href: getCalculatorCategoryHref("framing"),
                  label: "Framing",
                },
                {
                  href: getCalculatorCategoryHref("roofing"),
                  label: "Roofing",
                },
                {
                  href: getCalculatorCategoryHref("insulation"),
                  label: "Insulation",
                },
                {
                  href: getCalculatorCategoryHref("flooring"),
                  label: "Flooring",
                },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="block hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/60">
              Account
            </p>
            <div className="space-y-2">
              {accountNavigation.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Pro Construction Calc — legal & content */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded bg-[#FF8C00] text-black font-display font-black text-xs"
                aria-hidden
              >
                P
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/80">
                Pro Construction Calc
              </span>
            </div>
            <div className="space-y-2">
              {legalNavigation.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block hover:text-[#FF8C00] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 lg:flex-row lg:items-start">
          <p className="text-xs text-white/70">
            © {COPYRIGHT_YEAR} Pro Construction Calc. All rights reserved.
          </p>
          <p className="max-w-xl text-center text-xs text-white/45 lg:text-left">
            Calculator outputs are for estimating purposes only. Verify
            quantities, site conditions, and local code before ordering or
            building.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs lg:justify-end">
            <Link
              href={routes.privacy}
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href={routes.terms}
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <a
              href="mailto:amj111394@gmail.com"
              className="hover:text-white transition-colors"
            >
              Contact Us
            </a>
            <CookiePreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
