import Link from "next/link";
import { HardHat } from "lucide-react";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";
import { routes } from "@routes";

const COPYRIGHT_YEAR = 2026;
const footerCalculatorLinks = [
  { label: "Slab Thickness (Inches)", slug: "slab-thickness" },
  { label: "Running Lineal Feet", slug: "running-lineal-feet" },
  { label: "Cubic Yards", slug: "cubic-yards" },
];
const footerAccountLinks = [
  { label: "Sign In", slug: "sign-in" },
  { label: "Saved Estimates", slug: "estimates" },
  { label: "Price Book", slug: "business" },
  { label: "Business Profile", slug: "settings" },
  { label: "Command Center", slug: "dashboard" },
];
const footerLegalLinks = [
  { label: "Field Notes", slug: "field-notes" },
  { label: "FAQ", slug: "faq" },
  { label: "About", slug: "about" },
  { label: "Privacy Policy", slug: "privacy" },
  { label: "Terms of Service", slug: "terms" },
];

const buildCommandCenterLink = (slug?: string) =>
  slug
    ? {
        pathname: routes.commandCenter,
        query: { tool: slug },
      }
    : routes.commandCenter;

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-sm text-slate-300">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3 flex items-center gap-2 text-lg font-display font-black uppercase text-white">
              <HardHat className="w-5 h-5 text-orange-500" aria-hidden />
              Pro Construction Calc
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Free professional construction calculators for contractors and
              serious DIYers. Based in Central New York.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Pro Construction Calc · Rome, NY, USA
            </p>
            <div className="mt-4 inline-flex flex-col rounded-md border border-orange-600/60 bg-orange-600/10 px-3 py-2 text-white">
              <span className="font-display text-[11px] font-black uppercase tracking-[0.14em]">
                Built for the Field
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                Heavy-Duty Software
              </span>
            </div>
          </div>

          {/* Calculators */}
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
              Calculators
            </p>
            <div className="space-y-2">
              {footerCalculatorLinks.map(({ label, slug }) => (
                <Link
                  key={slug}
                  href={buildCommandCenterLink(slug)}
                  className="block hover:text-white transition-colors text-slate-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
              Account
            </p>
            <div className="space-y-2">
              {footerAccountLinks.map(({ label, slug }) => (
                <Link
                  key={slug}
                  href={buildCommandCenterLink(slug)}
                  className="block hover:text-white transition-colors text-slate-300"
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
                className="flex h-7 w-7 items-center justify-center rounded bg-orange-600 text-white font-display font-black text-xs"
                aria-hidden
              >
                P
              </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                Pro Construction Calc
              </span>
            </div>
            <div className="space-y-2">
              {footerLegalLinks.map(({ label, slug }) => (
                <Link
                  key={slug}
                  href={buildCommandCenterLink(slug)}
                  className="block hover:text-orange-500 transition-colors text-slate-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 lg:flex-row lg:items-start">
          <p className="text-xs text-slate-400">
            © {COPYRIGHT_YEAR} Pro Construction Calc. All rights reserved.
          </p>
          <p className="max-w-xl text-center text-xs text-slate-500 lg:text-left">
            Calculator outputs are for estimating purposes only. Verify
            quantities, site conditions, and local code before ordering or
            building.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs lg:justify-end">
            <Link
              href={buildCommandCenterLink("privacy")}
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href={buildCommandCenterLink("terms")}
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
