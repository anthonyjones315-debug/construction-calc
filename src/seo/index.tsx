import type { Metadata } from "next";

// ─── Per-page metadata ────────────────────────────────────────────────────────

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
}

const SEO_MAP: Record<string, SEOConfig> = {
  concrete: {
    title: "Concrete Calculator | Pro Construction Calc",
    description:
      "Calculate concrete volume in cubic yards and bags needed for slabs, footings, and forms. Free online concrete calculator.",
  },
  framing: {
    title: "Wall Framing Calculator | Pro Construction Calc",
    description:
      "Count studs, sheathing sheets, and fasteners for any wall framing project. Includes waste factor and drywall.",
  },
  roofing: {
    title: "Roofing Calculator | Pro Construction Calc",
    description:
      "Estimate roofing shingles, bundles, and decking from roof dimensions and pitch. Supports shingles and metal roofing.",
  },
  roofPitch: {
    title: "Roof Pitch Calculator | Pro Construction Calc",
    description:
      "Convert rise and run to pitch ratio, angle in degrees, and slope multiplier. Includes rafter length.",
  },
  roofingSquares: {
    title: "Roofing Squares Calculator | Pro Construction Calc",
    description:
      "Calculate roofing squares, shingle bundles, and ridge cap bundles from roof area and pitch.",
  },
  rafters: {
    title: "Rafter Length Calculator | Pro Construction Calc",
    description:
      "Calculate rafter length, buy length, and total board feet from building span, pitch, and overhang.",
  },
  flooring: {
    title: "Flooring Calculator | Pro Construction Calc",
    description:
      "Calculate flooring square footage with waste factor and material cost estimate. Works for any flooring type.",
  },
  insulation: {
    title: "Insulation Calculator | Pro Construction Calc",
    description:
      "Estimate fiberglass batt insulation packs by R-value, stud size, and spacing. Includes waste factor.",
  },
  sprayfoam: {
    title: "Spray Foam Calculator | Pro Construction Calc",
    description:
      "Calculate spray foam board feet, achieved R-value, and kit count. Supports open and closed cell foam.",
  },
  cellulose: {
    title: "Cellulose Insulation Calculator | Pro Construction Calc",
    description:
      "Estimate blown-in or dense-pack cellulose bags needed for any R-value and area.",
  },
  siding: {
    title: "Siding Calculator | Pro Construction Calc",
    description:
      "Estimate vinyl or wood siding squares and fasteners from wall area. Includes waste factor.",
  },
  paint: {
    title: "Paint Calculator | Pro Construction Calc",
    description:
      "Calculate paint gallons needed for any wall area and number of coats. Based on 350 sq ft per gallon coverage.",
  },
  labor: {
    title: "Labor Cost Calculator | Pro Construction Calc",
    description:
      "Estimate total labor cost from worker count, hours, and hourly wage.",
  },
  budget: {
    title: "Budget Tracker | Pro Construction Calc",
    description:
      "Track construction material costs with live pricing estimates and AI project analysis.",
  },
  home: {
    title: "Pro Construction Calc — Free Construction Calculators",
    description:
      "The Industrial-Grade Bidding Engine for NY Contractors. Trade-specific math, NYS tax compliance, and instant client dispatch.",
  },
  blog: {
    title: "Field Notes | Pro Construction Calc",
    description:
      "Construction guides, material tips, and how-to articles for contractors and DIYers.",
  },
  faq: {
    title: "FAQ | Pro Construction Calc",
    description:
      "Frequently asked questions about construction calculators, material estimates, and using Pro Construction Calc.",
  },
  about: {
    title: "About Pro Construction Calc",
    description:
      "Pro Construction Calc is a free suite of construction calculators built for contractors, builders, and DIYers.",
  },
  privacy: {
    title: "Privacy Policy | Pro Construction Calc",
    description:
      "Privacy policy for Pro Construction Calc. Learn how we handle your data.",
  },
};

export function getSEOMetadata(page: string): Metadata {
  const config = SEO_MAP[page] ?? SEO_MAP.home;
  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: config.canonical ?? "https://proconstructioncalc.com",
    },
    openGraph: {
      title: config.title,
      description: config.description,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

// ─── Structured Data / JSON-LD ────────────────────────────────────────────────

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pro Construction Calc",
    url: "https://proconstructioncalc.com",
    description:
      "The Industrial-Grade Bidding Engine for NY Contractors. Trade-specific math, NYS tax compliance, and instant client dispatch.",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://proconstructioncalc.com/calculators?c={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function getWebAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pro Construction Calc",
    url: "https://proconstructioncalc.com",
    description:
      "The Industrial-Grade Bidding Engine for NY Contractors. Trade-specific math, NYS tax compliance, and instant client dispatch.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "37",
      bestRating: "5",
      worstRating: "1",
    },
    creator: {
      "@type": "Organization",
      name: "Pro Construction Calc",
      url: "https://proconstructioncalc.com",
    },
  };
}

export function getCalculatorSchema(
  name: string,
  description: string,
  url: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "37",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function getFAQSchema(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function getBlogPostSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: `https://proconstructioncalc.com/field-notes/${post.slug}`,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Pro Construction Calc" },
    publisher: {
      "@type": "Organization",
      name: "Pro Construction Calc",
      url: "https://proconstructioncalc.com",
    },
  };
}

export function getFieldNotesArticleSchema(article: {
  title: string;
  description: string;
  slug: string;
  date: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `https://proconstructioncalc.com/field-notes/${article.slug}`,
    datePublished: article.date,
    author: { "@type": "Organization", name: "Pro Construction Calc" },
    publisher: {
      "@type": "Organization",
      name: "Pro Construction Calc",
      url: "https://proconstructioncalc.com",
    },
  };
}

// ─── JSON-LD Script Component ─────────────────────────────────────────────────

export function JsonLD({ schema }: { schema: object }) {
  const safeJson = JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
