import Link from "next/link";
import { HardHat } from "lucide-react";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";
import { getFieldNotesRoute, routes } from "@routes";
import {
  BUSINESS_CITY_STATE,
  BUSINESS_EMAIL,
  BUSINESS_NAME,
  BUSINESS_PHONE_DISPLAY,
} from "@/lib/business-identity";

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
  { label: "Field Notes", href: routes.fieldNotes },
  { label: "FAQ", href: routes.faq },
  { label: "About", href: routes.about },
  { label: "Financial Terms", href: routes.financialTerms },
  { label: "Glossary", href: routes.glossary },
  { label: "User Guide", href: routes.guide },
  { label: "Privacy Policy", href: routes.privacy },
  { label: "Terms of Service", href: routes.terms },
];
const footerCountyGuideLinks = [
  {
    label: "Madison County Tax (8.00%)",
    href: getFieldNotesRoute("madison-county-sales-tax-2026"),
  },
  {
    label: "Herkimer County Tax (8.25%)",
    href: getFieldNotesRoute("herkimer-county-sales-tax-2026"),
  },
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
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3 flex items-center gap-2 text-lg font-display font-black uppercase text-white">
              <HardHat className="w-5 h-5 text-orange-500" aria-hidden />
              {BUSINESS_NAME}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Contractor-grade construction calculators for working crews and estimators.
              Based in Floyd, NY and serving the Mohawk Valley.
            </p>
            <div className="mt-2 space-y-1 text-xs leading-relaxed text-slate-300">
              <p>{BUSINESS_NAME} · {BUSINESS_CITY_STATE}</p>
              <p>
                <a href={`tel:${BUSINESS_PHONE_DISPLAY}`} className="hover:text-white transition-colors">
                  {BUSINESS_PHONE_DISPLAY}
                </a>
              </p>
            </div>
            <div className="mt-4 inline-flex flex-col rounded-md border border-[--color-orange-brand]/60 bg-[--color-orange-brand]/10 px-3 py-2 text-white">
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
                className="flex h-7 w-7 items-center justify-center rounded bg-[--color-orange-brand] text-white font-display font-black text-xs"
                aria-hidden
              >
                P
              </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                {BUSINESS_NAME}
              </span>
            </div>
            <div className="space-y-2">
              {footerLegalLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block hover:text-orange-500 transition-colors text-slate-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
              County Guides
            </p>
            <div className="space-y-2">
              {footerCountyGuideLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
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
              href={`mailto:${BUSINESS_EMAIL}`}
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
