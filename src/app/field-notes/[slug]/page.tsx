import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getFieldNotesArticleSchema, getPageMetadata } from "@/seo";
import {
  getFieldNoteBySlug,
  FIELD_NOTES,
} from "../data";
import { ArrowLeft, Calculator } from "lucide-react";
import { routes } from "@routes";
import { ArticleMarkdown } from "@/components/content/ArticleMarkdown";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return FIELD_NOTES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getFieldNoteBySlug(slug);
  if (!note) return {};
  return getPageMetadata({
    title: `${note.title} | Pro Construction Calc`,
    description: note.description,
    path: `/field-notes/${slug}`,
    type: "article",
  });
}

export default async function FieldNoteArticlePage({ params }: Props) {
  const { slug } = await params;
  const note = getFieldNoteBySlug(slug);
  if (!note) notFound();

  return (
    <div className="page-shell flex min-h-dvh flex-col bg-[var(--color-bg)]">
      <Header />
      <JsonLD schema={getFieldNotesArticleSchema(note)} />
      <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Link
            href={routes.fieldNotes}
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-[--color-ink-dim] transition-colors hover:text-[--color-ink]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Field Notes
          </Link>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Main article */}
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[--color-orange-soft] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[--color-orange-brand]">
                  {note.category}
                </span>
                <span className="text-xs text-[--color-ink-dim]">
                  {note.date}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight text-[--color-ink] md:text-4xl">
                {note.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-[--color-ink-dim]">
                {note.description}
              </p>
              {note.lastVerified || note.sources?.length ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  {note.lastVerified ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-ink-dim]">
                      Last verified: {note.lastVerified}
                    </p>
                  ) : null}
                  {note.sources?.length ? (
                    <div className="mt-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-ink-dim]">
                        Sources
                      </p>
                      <ul className="mt-2 space-y-1">
                        {note.sources.map((source) => (
                          <li key={source}>
                            <a
                              href={source}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-[--color-orange-brand] transition-colors hover:text-[--color-orange-dark] hover:underline"
                            >
                              {source}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <article
                className="mt-10 rounded-2xl border border-white/10 bg-[var(--color-surface)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.12)] sm:p-8"
              >
                <ArticleMarkdown content={note.content} />
                {/* Pro Tip lead hook — every article */}
                <div className="mt-10 rounded-2xl border border-[--color-orange-brand]/25 bg-[--color-orange-soft]/40 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[--color-orange-brand]">
                    Pro Tip
                  </p>
                  <p className="mt-2 text-sm text-[--color-ink-mid] leading-relaxed">
                    Need a custom estimation workflow for your crew? Contact the
                    Pro Calc team.
                  </p>
                </div>
              </article>
            </div>

            {/* Stay-on-Site: Use This Tool sidebar */}
            <aside
              className="lg:w-72 shrink-0"
              aria-label="Related calculators"
            >
              <div className="sticky top-24 rounded-2xl border border-[--color-orange-brand]/30 bg-[--color-orange-soft]/50 p-5 shadow-[0_10px_30px_rgba(247,148,29,0.08)]">
                <div className="flex items-center gap-2 text-[--color-orange-brand]">
                  <Calculator className="h-5 w-5" aria-hidden />
                  <span className="text-sm font-bold uppercase tracking-[0.1em]">
                    Use This Tool
                  </span>
                </div>
                <p className="mt-2 text-sm text-[--color-ink-mid]">
                  Run the numbers with our calculators — stay on-site, no
                  external links.
                </p>
                <ul className="mt-4 space-y-2">
                  {note.relatedToolLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href as Route}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[--color-ink] transition-colors hover:text-[--color-orange-brand]"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[--color-orange-brand]" aria-hidden />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={routes.calculators}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:brightness-95"
                >
                  All Calculators →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
