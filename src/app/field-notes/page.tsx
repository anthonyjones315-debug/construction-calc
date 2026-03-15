import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FIELD_NOTES } from "./data";
import { FileText } from "lucide-react";
import { getFieldNotesRoute } from "@routes";

export const metadata: Metadata = {
  title: "Field Notes | Pro Construction Calc",
  description:
    "Regional construction guides and contractor tips for Oneida County, Rome, Utica, and the Mohawk Valley. Frost depth, retainage, insulation, and more.",
  alternates: {
    canonical: "https://proconstructioncalc.com/field-notes",
  },
};

export default function FieldNotesHubPage() {
  const [featured, ...rest] = FIELD_NOTES;

  return (
    <div className="page-shell flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {/* Hero */}
          <div className="mb-12 rounded-2xl border border-white/10 bg-[var(--color-surface)] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[--color-orange-brand]">
              Methods and guidance
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-[--color-ink] sm:text-4xl">
              Field Notes
            </h1>
            <p className="mt-3 max-w-2xl text-[--color-ink-dim]">
              Regional guides and contractor tips for Oneida County and the
              Mohawk Valley. No fluff — field notes, not filler.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]">
              100% on-site · No external click-aways
            </div>
          </div>

          {/* Editorial grid: featured + 2-col */}
          <div className="grid gap-8 lg:grid-cols-2">
            {featured && (
              <article
                className="rounded-2xl border border-white/10 bg-[var(--color-surface)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_18px_38px_rgba(15,18,27,0.15)] lg:col-span-2"
                aria-label={`Featured: ${featured.title}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[--color-orange-soft] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[--color-orange-brand]">
                        {featured.category}
                      </span>
                      <span className="text-xs text-[--color-ink-dim]">
                        {featured.date}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-[--color-ink] sm:text-2xl">
                      <Link
                        href={getFieldNotesRoute(featured.slug)}
                        className="transition-colors hover:text-[--color-orange-brand]"
                      >
                        {featured.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[--color-ink-dim]">
                      {featured.description}
                    </p>
                    <Link
                      href={getFieldNotesRoute(featured.slug)}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[--color-orange-brand] transition-colors hover:text-[--color-orange-dark]"
                    >
                      <FileText className="h-4 w-4" aria-hidden />
                      Read article →
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {rest.map((note) => (
              <article
                key={note.slug}
                className="rounded-2xl border border-white/10 bg-[var(--color-surface)] p-6 transition-shadow hover:shadow-[0_18px_38px_rgba(15,18,27,0.12)]"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[--color-orange-soft] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[--color-orange-brand]">
                    {note.category}
                  </span>
                  <span className="text-xs text-[--color-ink-dim]">
                    {note.date}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-[--color-ink]">
                  <Link
                    href={getFieldNotesRoute(note.slug)}
                    className="transition-colors hover:text-[--color-orange-brand]"
                  >
                    {note.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[--color-ink-dim]">
                  {note.description}
                </p>
                <Link
                  href={getFieldNotesRoute(note.slug)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[--color-orange-brand] transition-colors hover:text-[--color-orange-dark]"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  Read article →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
