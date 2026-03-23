import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getPageMetadata } from "@/seo";
import { FIELD_NOTES } from "./data";
import { FileText, ArrowRight } from "lucide-react";
import { getFieldNotesRoute } from "@routes";

export const metadata: Metadata = getPageMetadata({
  title: "Field Notes | Pro Construction Calc",
  description:
    "Practical construction guides for Upstate NY contractors — tax math, estimating workflows, insulation codes, and trade-specific how-tos for Oneida, Madison, and Herkimer counties.",
  path: "/field-notes",
});

export default function FieldNotesHubPage() {
  return (
    <div className="light public-page page-shell grid min-h-dvh grid-rows-[auto_1fr] overflow-hidden">
      <Header />
      <main id="main-content" className="row-start-2 viewport-main">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 sm:px-6">
          {/* Hero */}
          <div className="rounded-2xl border border-[--color-border] bg-white p-6 md:p-8 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">
              Methods and guidance
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-[--color-ink] sm:text-4xl">
              Field Notes
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[--color-ink-mid] sm:text-base">
              Trade-grade guides on estimating, code interpretations, and field
              math. Practical workflows built for contractors in Oneida, Madison,
              and Herkimer counties.
            </p>
            <div className="mt-5 inline-flex rounded-full border border-[--color-border] bg-[--color-surface-alt] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[--color-ink-dim]">
              All guidance built in · No leaving to look it up
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FIELD_NOTES.map((note) => (
              <article
                key={note.slug}
                className="group flex min-h-[220px] flex-col rounded-2xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm transition-all duration-200 hover:border-[--color-blue-brand]/40 hover:shadow-md"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[--color-blue-soft] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[--color-blue-brand]">
                    {note.category}
                  </span>
                  {note.category === "Energy" && (
                    <span className="rounded-full bg-[--color-blue-brand]/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[--color-blue-dark]">
                      2026 Update
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-[--color-ink-dim] uppercase tracking-wide">
                    {note.date}
                  </span>
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight text-[--color-ink] transition-colors group-hover:text-[--color-blue-brand]">
                  <Link
                    href={getFieldNotesRoute(note.slug)}
                    className="focus:outline-none"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    {note.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[--color-ink-mid] line-clamp-3">
                  {note.description}
                </p>
                <div className="mt-auto pt-4 flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-[--color-blue-brand]">
                  <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Read Method
                  <ArrowRight className="ml-1 h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
