import Link from "next/link";
import type { TradePageDefinition } from "../_lib/trade-pages";

const CATEGORY_LABELS: Record<TradePageDefinition["category"], string> = {
  concrete: "Concrete & Masonry",
  framing: "Framing & Lumber",
  roofing: "Roofing & Siding",
  mechanical: "Mechanical & Site",
  insulation: "HVAC & Insulation",
  finish: "Finish Carpentry",
  management: "Construction Management",
  interior: "Interior Finish",
  business: "Business & Estimating",
};

export function CalculatorBreadcrumb({ page }: { page: TradePageDefinition }) {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Calculators", href: "/calculators" },
    { label: CATEGORY_LABELS[page.category], href: `/calculators/${page.category}` },
    ...(page.type === "calculator"
      ? [{ label: page.title, href: page.canonicalPath }]
      : []),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-[--color-border] bg-[--color-surface-alt] px-4 py-1.5 sm:px-6"
    >
      <ol className="mx-auto flex max-w-6xl items-center gap-1.5 text-[11px] text-slate-500">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-300">/</span>}
            <Link
              href={crumb.href}
              className={
                i === crumbs.length - 1
                  ? "font-semibold text-slate-800"
                  : "hover:text-orange-600 transition-colors"
              }
              aria-current={i === crumbs.length - 1 ? "page" : undefined}
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
