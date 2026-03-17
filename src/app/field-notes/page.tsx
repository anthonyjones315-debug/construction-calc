import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getPageMetadata } from "@/seo";
import { FIELD_NOTES } from "./data";
import { FileText } from "lucide-react";
import { getFieldNotesRoute } from "@routes";

export const metadata: Metadata = getPageMetadata({
  title: "Field Notes | Pro Construction Calc",
  description:
    "Regional construction guides and contractor tips for Oneida, Madison, and Herkimer counties. Tax math, estimating workflows, insulation, and more.",
  path: "/field-notes",
});

export default function FieldNotesHubPage() {
  return (
    <div className="page-shell flex min-h-dvh flex-col bg-[var(--color-bg)]">
      <Header />
      <main id="main-content" className="viewport-main">
        <div className="viewport-frame max-w-6xl">
          {/* Hero */}
          <div className="rounded-2xl border border-white/10 bg-[var(--color-surface)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
              Methods and guidance
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-bold text-[--color-ink] sm:text-3xl">
              Field Notes
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[--color-ink-dim]">
              Regional guides and contractor tips for Oneida, Madison, and
              Herkimer counties. No fluff, just useful field guidance.
            </p>
            <div className="mt-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]">
              100% on-site · No external click-aways
            </div>
          </div>

          {/* Card grid: all notes in a uniform grid */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {FIELD_NOTES.map((note) => (
              <article
                key={note.slug}
                className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[var(--color-surface)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_18px_38px_rgba(15,18,27,0.15)]"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[--color-orange-soft] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[--color-orange-brand]">
                    {note.category}
                  </span>
                  {note.category === "Energy" && (
                    <span className="rounded-full bg-orange-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-500">
                      2026 Update
                    </span>
                  )}
                  <span className="text-xs text-[--color-ink-dim]">
                    {note.date}
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-[--color-ink]">
                  <Link
                    href={getFieldNotesRoute(note.slug)}
                    className="transition-colors hover:text-[--color-orange-brand]"
                  >
                    {note.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[--color-ink-dim] line-clamp-4">
                  {note.description}
                </p>
                <Link
                  href={getFieldNotesRoute(note.slug)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[--color-orange-brand] transition-colors hover:text-[--color-orange-dark]"
                >
                  <FileText className="h-4 w-4 shrink-0" aria-hidden />
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
