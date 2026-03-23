import Link from "next/link";
import type { Route } from "next";
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
  landscape: "Lawn & Landscape",
  outdoor: "Fences, Driveways & Patios",
};

export function CalculatorBreadcrumb({ page }: { page: TradePageDefinition }) {
  type Crumb = {
    label: string;
    href: Route;
  };

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" as Route },
    { label: "Calculators", href: "/calculators" as Route },
    {
      label: CATEGORY_LABELS[page.category],
      href: `/calculators/${page.category}` as Route,
    },
    ...(page.type === "calculator"
      ? [{ label: page.title, href: page.canonicalPath as Route }]
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
            {i === crumbs.length - 1 ? (
              <span className="font-semibold text-slate-800" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-[--color-blue-brand]"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
