import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getBlogPostSchema } from "@/seo";
import { BLOG_POSTS } from "@/data/blog";

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

export const metadata: Metadata = {
  title: "Construction Tips & Guides | Build Calc Pro",
  description:
    "Construction guides, material tips, and how-to articles for contractors and DIYers.",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="main-content" className="flex-1 bg-[--color-bg]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-display font-bold text-[--color-ink] mb-2">
            Construction Tips & Guides
          </h1>
          <p className="text-[--color-ink-dim] mb-10">
            How-to articles and material guides for builders and DIYers.
          </p>

          <div className="space-y-6">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <JsonLD schema={getBlogPostSchema(post)} />
                <div className="rounded-xl overflow-hidden border border-gray-100 mb-4">
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
                    href={`/blog/${post.slug}`}
                    className="hover:text-[--color-orange-brand] transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-[--color-ink-dim] leading-relaxed mb-4">
                  {post.description}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
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
