import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getBlogPostSchema, getPageMetadata } from "@/seo";
import { BLOG_POSTS } from "@/data/blog";
import { getBlogPostRoute } from "@routes";

const BLOG_CATEGORY_IMAGES: Record<string, { src: string; alt: string }> = {
  Concrete: {
    src: "/images/concrete-slab.svg",
    alt: "Concrete slab setup used for volume and bag calculations",
  },
  Framing: {
    src: "/images/wall-framing.svg",
    alt: "Wall framing layout with studs and plate lines",
  },
  Roofing: {
    src: "/images/roof-pitch.svg",
    alt: "Roof pitch triangle for rise-run and slope calculations",
  },
  Insulation: {
    src: "/images/cellulose-insulation.svg",
    alt: "Cellulose insulation bags staged for attic installation",
  },
};

export const metadata: Metadata = getPageMetadata({
  title: "Construction Tips & Guides | Pro Construction Calc",
  description:
    "Construction guides, material tips, and how-to articles for contractors and DIYers.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <div className="light public-page page-shell">
      <Header />
      <main id="main-content" className="flex-1">
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
            {BLOG_POSTS.map((post, index) => (
              <article
                key={post.slug}
                className="content-card content-card-interactive p-6 transition-all duration-200 hover:border-[--color-orange-brand]/50 hover:shadow-[0_18px_38px_rgba(15,18,27,0.12)]"
              >
                <JsonLD schema={getBlogPostSchema(post)} />
                <div className="trim-border-strong mb-4 overflow-hidden rounded-xl border">
                  <Image
                    src={
                      (
                        BLOG_CATEGORY_IMAGES[post.category] ??
                        BLOG_CATEGORY_IMAGES.Concrete
                      ).src
                    }
                    alt={
                      (
                        BLOG_CATEGORY_IMAGES[post.category] ??
                        BLOG_CATEGORY_IMAGES.Concrete
                      ).alt
                    }
                    width={1200}
                    height={700}
                    priority={index === 0}
                    className="w-full h-40 object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[--color-orange-brand] bg-[--color-orange-soft] px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-[--color-ink-dim]">
                    {post.date}
                  </span>
                </div>
                <h2 className="text-xl font-display font-bold text-[--color-ink] mb-2">
                  <Link
                    href={getBlogPostRoute(post.slug)}
                    className="hover:text-[--color-orange-brand] transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-[--color-ink-dim] leading-relaxed mb-4">
                  {post.description}
                </p>
                <Link
                  href={getBlogPostRoute(post.slug)}
                  className="text-sm font-semibold text-[--color-orange-brand] hover:text-[--color-orange-dark] transition-colors"
                >
                  Read more →
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
