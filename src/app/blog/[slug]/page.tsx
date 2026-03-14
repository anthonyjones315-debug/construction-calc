import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getBlogPostSchema } from "@/seo";
import { BLOG_POSTS } from "@/data/blog";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\(\/\))/g;
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={`strong-${key++}`}>{token.slice(2, -2)}</strong>);
    } else {
      const linkText = token.slice(1, token.indexOf("]"));
      nodes.push(
        <Link key={`link-${key++}`} href="/">
          {linkText}
        </Link>,
      );
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Build Calc Pro`,
    description: post.description,
    alternates: { canonical: `https://proconstructioncalc.com/blog/${slug}` },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  // Convert markdown-ish content to paragraphs for rendering
  const sections = post.content.trim().split(/\n\n+/);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <JsonLD schema={getBlogPostSchema(post)} />
      <main id="main-content" className="flex-1 bg-[--color-bg]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[--color-ink-dim] hover:text-[--color-ink] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[--color-orange-brand] bg-[--color-orange-soft] px-2.5 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-[--color-ink-dim]">{post.date}</span>
          </div>

          <h1 className="text-3xl font-display font-bold text-[--color-ink] mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-lg text-[--color-ink-dim] mb-10 leading-relaxed">
            {post.description}
          </p>

          <article
            className="prose prose-slate max-w-none
              prose-headings:font-display prose-headings:font-bold prose-headings:text-[--color-ink]
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-[--color-ink-mid] prose-p:leading-relaxed
              prose-li:text-[--color-ink-mid]
              prose-strong:text-[--color-ink] prose-strong:font-semibold
              prose-a:text-[--color-orange-brand] prose-a:no-underline hover:prose-a:underline
              prose-table:text-sm prose-th:bg-[--color-surface-alt] prose-th:font-semibold
              prose-hr:border-gray-200"
          >
            {sections.map((section, i) => {
              if (section.startsWith("## ")) {
                return <h2 key={i}>{section.replace("## ", "")}</h2>;
              }
              if (section.startsWith("### ")) {
                return <h3 key={i}>{section.replace("### ", "")}</h3>;
              }
              if (section.startsWith("- ")) {
                return (
                  <ul key={i}>
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
                // Table
                const rows = section.split("\n").filter((r) => r.includes("|"));
                return (
                  <div key={i} className="overflow-x-auto my-4">
                    <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                      <tbody>
                        {rows
                          .filter((r) => !r.match(/^\|[-\s|]+\|$/))
                          .map((row, j) => {
                            const cells = row
                              .split("|")
                              .filter((c) => c.trim());
                            return (
                              <tr
                                key={j}
                                className={
                                  j === 0
                                    ? "bg-[--color-surface-alt] font-semibold"
                                    : "border-t border-gray-100"
                                }
                              >
                                {cells.map((cell, k) => (
                                  <td key={k} className="px-3 py-2">
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
              return <p key={i}>{renderInline(section)}</p>;
            })}
          </article>

          <div className="mt-12 p-6 bg-[--color-orange-soft] rounded-2xl border border-[--color-orange-brand]/20">
            <p className="text-sm font-semibold text-[--color-orange-brand] mb-1">
              Try the calculator
            </p>
            <p className="text-sm text-[--color-ink-mid] mb-3">
              Use our free {post.category.toLowerCase()} calculator for instant,
              accurate estimates.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
            >
              Open Calculator →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
