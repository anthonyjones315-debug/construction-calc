import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getBlogPostSchema, getPageMetadata } from "@/seo";
import { BLOG_POSTS } from "@/data/blog";
import { getBlogPostRoute } from "@routes";
import { BrickWall, Hammer, Triangle, Layers } from "lucide-react";

// Map blog categories to brand icons
const BLOG_CATEGORY_ICONS: Record<string, typeof BrickWall> = {
  Concrete: BrickWall,
  Framing: Hammer,
  Roofing: Triangle,
  Insulation: Layers,
};

// NOTE: Legacy image assets removed in favor of brand Lucide icons.
// Keeping the constant for potential future use, but currently unused.
  // Remove unused images constant
  // const BLOG_CATEGORY_IMAGES = {};


export const metadata: Metadata = getPageMetadata({
  title: "Construction Tips & Guides | Pro Construction Calc",
  description:
    "Construction guides, material tips, and how-to articles for contractors and DIYers.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <div className="light public-page page-shell flex min-h-dvh flex-col overflow-y-auto">
      <Header />
      <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="dark-feature-panel mb-8 p-6 text-[--color-ink] relative">
            <p className="section-kicker">Methods and guidance</p>
            <h1 className="mt-2 text-3xl font-display font-bold">
              Construction Tips & Guides
            </h1>
            <p className="mt-2 text-[--color-ink-mid]">
              How-to articles and material guides for builders and DIYers.
            </p>

            <div className="trim-nav-border mt-4 inline-flex rounded-full border bg-[--color-surface-alt] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[--color-ink]">
              Field notes, not filler
            </div>
          </div>

          <div className="space-y-6">
            {BLOG_POSTS.map((post) => (
              <Link key={post.slug} href={getBlogPostRoute(post.slug)} className="block hover:text-[--color-blue-brand] transition-colors">
                <article
                  key={post.slug}
                  className="content-card content-card-interactive p-6 transition-all duration-200 hover:border-[--color-blue-brand]/50 hover:shadow-[0_18px_38px_rgba(15,18,27,0.12)]"
                >
                  <JsonLD schema={getBlogPostSchema(post)} />
                  <div className="trim-border-strong mb-4 overflow-hidden rounded-xl border">
                    {(() => {
                      const Icon = BLOG_CATEGORY_ICONS[post.category] ?? BrickWall;
                      return (
                        <Icon
                          className="w-full h-40 text-[--color-blue-brand]"
                          strokeWidth={1.2}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[--color-blue-brand] bg-[--color-blue-soft] px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-[--color-ink-dim]">
                      {post.date}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-[--color-ink] mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[--color-ink-dim] leading-relaxed mb-4">
                    {post.description}
                  </p>
                  <span className="text-sm font-semibold text-[--color-blue-brand] hover:text-[--color-blue-dark] transition-colors">
                    Read more →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
