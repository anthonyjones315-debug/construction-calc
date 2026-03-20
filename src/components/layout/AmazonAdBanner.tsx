"use client";

/**
 * AmazonAdBanner
 * --------------
 * Affiliate ad units using the Amazon Associates proconstruct-20 tag.
 * Products are scoped to tools contractors actually buy after running estimates.
 *
 * Uses <a> (not Next.js <Link>) because these are external URLs.
 *
 * Variants:
 *   "signin"  — compact 2-col grid below the sign-in card (max-w-sm context)
 *   "home"    — sidebar panel in the home page secondary column
 */

import { ExternalLink, ShoppingCart } from "lucide-react";

// ── Amazon tag ────────────────────────────────────────────────────────────────

const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "proconstruct-20";

function buildUrl(path: string, extraParams?: Record<string, string>): string {
  const base = "https://www.amazon.com";
  const params = new URLSearchParams({ tag: TAG, ref: "pcc_nav", ...extraParams });
  return `${base}${path}?${params.toString()}`;
}

// ── Product data — specific, high-intent contractor tools ─────────────────────
// Each entry links to Amazon search results for the exact tool a contractor
// would purchase after running a concrete, framing, or roofing estimate.

interface AdProduct {
  label: string;
  /** Shown under the label — keeps it useful, not generic */
  desc: string;
  /** Amazon /s search path + keywords param */
  url: string;
}

const PRODUCTS: AdProduct[] = [
  {
    label: "Laser Measures",
    desc: "Instant room & span dims",
    url: buildUrl("/s", { k: "laser+distance+measurer+contractor+400ft", i: "tools" }),
  },
  {
    label: "Framing Squares",
    desc: "Layout, rafters & stair stringers",
    url: buildUrl("/s", { k: "framing+speed+square+rafter+layout", i: "tools" }),
  },
  {
    label: "Concrete Mixers",
    desc: "Portable electric & drum mixers",
    url: buildUrl("/s", { k: "portable+concrete+mixer+electric", i: "tools" }),
  },
  {
    label: "Roofing Nailers",
    desc: "Pneumatic coil nailers",
    url: buildUrl("/s", { k: "roofing+coil+nailer+pneumatic", i: "tools" }),
  },
  {
    label: "Chalk Lines",
    desc: "Snap lines for layout & framing",
    url: buildUrl("/s", { k: "chalk+line+reel+contractor", i: "tools" }),
  },
  {
    label: "Utility Knives",
    desc: "Heavy-duty retractable blades",
    url: buildUrl("/s", { k: "heavy+duty+utility+knife+contractor", i: "tools" }),
  },
];

// "Browse all" CTA — lands on contractor hand tools storefront
const BROWSE_ALL_URL = buildUrl("/b", { node: "512152011", ref: "pcc_browse" });

// ── Shared disclosure footer ──────────────────────────────────────────────────

function Disclosure() {
  return (
    <p className="mt-3 text-center text-[9px] leading-relaxed text-[--color-ink-dim]">
      Amazon Associate — we earn from qualifying purchases.{" "}
      <span className="font-semibold uppercase tracking-wide">Sponsored</span>
    </p>
  );
}

// ── Sign-in variant — compact 2-col grid ─────────────────────────────────────

function SignInAdStrip() {
  // Show first 4 products in a 2-col grid to stay compact at max-w-sm
  const shown = PRODUCTS.slice(0, 4);

  return (
    <div className="content-card mt-5 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-1.5">
        <ShoppingCart
          className="h-3.5 w-3.5 shrink-0 text-[--color-orange-brand]"
          aria-hidden
        />
        <p className="section-kicker">Contractor Gear</p>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-2">
        {shown.map((item) => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-tactile block rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 transition-all hover:border-orange-300 hover:bg-orange-50"
          >
            <p className="text-[11px] font-bold text-slate-800">{item.label}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{item.desc}</p>
          </a>
        ))}
      </div>

      {/* Browse CTA */}
      <a
        href={BROWSE_ALL_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="btn-tactile mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 transition-all hover:border-orange-300 hover:text-orange-700"
      >
        Browse All Tools on Amazon
        <ExternalLink className="h-3 w-3" aria-hidden />
      </a>

      <Disclosure />
    </div>
  );
}

// ── Home sidebar variant — full panel with all 6 products ────────────────────

function HomeSidebarAd() {
  return (
    <div className="content-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <ShoppingCart
          className="h-4 w-4 shrink-0 text-[--color-orange-brand]"
          aria-hidden
        />
        <p className="section-kicker">Shop Contractor Gear</p>
      </div>

      {/* Product list */}
      <div className="space-y-1.5">
        {PRODUCTS.map((item) => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-tactile flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition-all hover:border-orange-300 hover:bg-orange-50"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-800">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-500">
                {item.desc}
              </p>
            </div>
            <ExternalLink
              className="h-3 w-3 shrink-0 text-slate-400"
              aria-hidden
            />
          </a>
        ))}
      </div>

      {/* Browse CTA */}
      <a
        href={BROWSE_ALL_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="btn-tactile mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 active:scale-[0.98]"
      >
        Browse All Tools on Amazon
        <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
      </a>

      <Disclosure />
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export type AmazonAdVariant = "signin" | "home";

export function AmazonAdBanner({ variant }: { variant: AmazonAdVariant }) {
  if (variant === "signin") return <SignInAdStrip />;
  return <HomeSidebarAd />;
}
