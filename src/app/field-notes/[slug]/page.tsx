import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getFieldNotesArticleSchema } from "@/seo";
import {
  getFieldNoteBySlug,
  FIELD_NOTES,
  type FieldNote,
} from "../data";
import { ArrowLeft, Calculator } from "lucide-react";
import type { Route } from "next";
import { routes } from "@routes";

interface Props {
  params: Promise<{ slug: string }>;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Support **bold** and [text](/path) or [text](https://...) for internal links
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/[^)]+|\/[^)]*)\))/g;
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`strong-${key++}`}>{token.slice(2, -2)}</strong>
      );
    } else {
      const labelEnd = token.indexOf("]");
      const linkText = token.slice(1, labelEnd);
      const href = token.slice(token.indexOf("(") + 1, -1);
      const isInternal = href.startsWith("/");
      if (isInternal) {
        nodes.push(
          <Link
            key={`link-${key++}`}
            href={href as Route}
            className="font-medium text-[--color-orange-brand] hover:underline"
          >
            {linkText}
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={`link-${key++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[--color-orange-brand] hover:underline"
          >
            {linkText}
          </a>
        );
      }
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function ArticleContent({ note }: { note: FieldNote }) {
  const sections = note.content.trim().split(/\n\n+/);

  return (
    <>
      {sections.map((section, i) => {
        if (section.startsWith("## ")) {
          return (
            <h2 key={i} className="font-display text-2xl font-bold text-[--color-ink] mt-8 mb-3">
              {section.replace("## ", "")}
            </h2>
          );
        }
        if (section.startsWith("### ")) {
          return (
            <h3 key={i} className="font-display text-lg font-bold text-[--color-ink] mt-6 mb-2">
              {section.replace("### ", "")}
            </h3>
          );
        }
        if (section.startsWith("- ")) {
          return (
            <ul key={i} className="list-disc pl-6 my-4 space-y-1 text-[--color-ink-mid] leading-relaxed">
              {section
                .split("\n")
                .filter((l) => l.startsWith("- "))
                .map((line, j) => (
                  <li key={j}>{renderInline(line.replace("- ", ""))}</li>
                ))}
            </ul>
          );
        }
        if (section.includes("|")) {
          const rows = section.split("\n").filter((r) => r.includes("|"));
          return (
            <div key={i} className="overflow-x-auto my-4">
              <table className="w-full overflow-hidden rounded-xl border border-[--color-border] text-sm">
                <tbody>
                  {rows
                    .filter((r) => !r.match(/^\|[-\s|]+\|$/))
                    .map((row, j) => {
                      const cells = row.split("|").filter((c) => c.trim());
                      return (
                        <tr
                          key={j}
                          className={
                            j === 0
                              ? "bg-[--color-surface-alt] font-semibold"
                              : "border-t border-[--color-border]"
                          }
                        >
                          {cells.map((cell, k) => (
                            <td
                              key={k}
                              className="px-3 py-2 text-[--color-ink-mid]"
                            >
                              {cell.trim()}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={i} className="text-[--color-ink-mid] leading-relaxed my-3">
            {renderInline(section)}
          </p>
        );
      })}
    </>
  );
}

export async function generateStaticParams() {
  return FIELD_NOTES.map((n) => ({ slug: n.slug }));
}

const SITE_URL = "https://proconstructioncalc.com";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getFieldNoteBySlug(slug);
  if (!note) return {};
  const canonicalUrl = `${SITE_URL}/field-notes/${slug}`;
  return {
    title: `${note.title} | Pro Construction Calc`,
    description: note.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${note.title} | Pro Construction Calc`,
      description: note.description,
      url: canonicalUrl,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "article",
    },
  };
}

export default async function FieldNoteArticlePage({ params }: Props) {
  const { slug } = await params;
  const note = getFieldNoteBySlug(slug);
  if (!note) notFound();

  return (
    <div className="page-shell flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Header />
      <JsonLD schema={getFieldNotesArticleSchema(note)} />
      <main id="main-content" className="flex-1">
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

              <article
                className="mt-10 rounded-2xl border border-white/10 bg-[var(--color-surface)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.12)] sm:p-8
                  prose prose-slate max-w-none
                  prose-headings:font-display prose-headings:font-bold prose-headings:text-[--color-ink]
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
                  prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                  prose-p:text-[--color-ink-mid] prose-p:leading-relaxed
                  prose-li:text-[--color-ink-mid]
                  prose-strong:text-[--color-ink] prose-strong:font-semibold
                  prose-a:text-[--color-orange-brand] prose-a:no-underline hover:prose-a:underline
                  prose-table:text-sm prose-th:bg-[--color-surface-alt] prose-th:font-semibold
                  prose-hr:border-[--color-border]"
              >
                <ArticleContent note={note} />
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
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:brightness-95"
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
