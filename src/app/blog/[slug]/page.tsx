import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getBlogPostSchema, getPageMetadata } from "@/seo";
import { BLOG_POSTS } from "@/data/blog";
import { ArrowLeft } from "lucide-react";
import { getBlogPostRoute, routes } from "@routes";
import { ArticleMarkdown } from "@/components/content/ArticleMarkdown";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return getPageMetadata({
    title: `${post.title} | Pro Construction Calc`,
    description: post.description,
    path: getBlogPostRoute(slug),
    type: "article",
  });
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Header />
      <JsonLD schema={getBlogPostSchema(post)} />
      <main id="main-content" className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <Link
            href={routes.blog}
            scroll={true}
            className="inline-flex items-center gap-1.5 text-sm text-[--color-ink-dim] hover:text-[--color-ink] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-4 flex items-center gap-2">
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

          <article className="content-card p-8">
            <ArticleMarkdown content={post.content} />
          </article>

          <div className="mt-12 rounded-2xl border border-[--color-orange-brand]/20 bg-[--color-orange-soft] p-6">
            <p className="text-sm font-semibold text-[--color-orange-brand] mb-1">
              Try the calculator
            </p>
            <p className="text-sm text-[--color-ink-mid] mb-3">
              Use our free {post.category.toLowerCase()} calculator for instant,
              accurate estimates.
            </p>
            <Link
              href={routes.home}
              scroll={true}
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
