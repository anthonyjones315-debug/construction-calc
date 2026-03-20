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
    "Practical construction guides for Upstate NY contractors — tax math, estimating workflows, insulation codes, and trade-specific how-tos for Oneida, Madison, and Herkimer counties.",
  path: "/field-notes",
});

export default function FieldNotesHubPage() {
  return (
    <div className="light public-page page-shell">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 sm:px-6">
          {/* Hero */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
              Methods and guidance
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Field Notes
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Practical guides built for contractors in Oneida, Madison, and
              Herkimer counties. Trade methods, tax math, code notes, and
              estimating tips — everything you need without leaving the app.
            </p>
            <div className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              All guidance built in · No leaving to look it up
            </div>
          </div>

          {/* Card grid: all notes in a uniform grid */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {FIELD_NOTES.map((note) => (
              <article
                key={note.slug}
                className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-600">
                    {note.category}
                  </span>
                  {note.category === "Energy" && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
                      2026 Update
                    </span>
                  )}
                  <span className="text-xs text-slate-500">{note.date}</span>
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  <Link
                    href={getFieldNotesRoute(note.slug)}
                    className="transition-colors hover:text-orange-600"
                  >
                    {note.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600 line-clamp-4">
                  {note.description}
                </p>
                <Link
                  href={getFieldNotesRoute(note.slug)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-orange-600 transition-colors hover:text-orange-700"
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
