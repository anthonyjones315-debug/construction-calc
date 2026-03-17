import type { Metadata } from "next";
import {
  BUSINESS_AREAS_SERVED,
  BUSINESS_COUNTRY,
  BUSINESS_EMAIL,
  BUSINESS_NAME,
  BUSINESS_PHONE_E164,
  BUSINESS_REGION,
  BUSINESS_SITE_URL,
  BUSINESS_STATE,
  BUSINESS_WHATSAPP_URL,
  GOOGLE_BUSINESS_PROFILE_ID,
  GOOGLE_BUSINESS_PROFILE_URL,
} from "@/lib/business-identity";

// ─── Per-page metadata ────────────────────────────────────────────────────────

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  canonical?: string;
  keywords?: Metadata["keywords"];
  type?: "website" | "article";
};

export type VerifiedBusinessReview = {
  authorName: string;
  ratingValue: number;
  reviewBody: string;
  datePublished: string;
  url?: string;
};

export const VERIFIED_BUSINESS_REVIEWS: VerifiedBusinessReview[] = [];

const DEFAULT_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: `${BUSINESS_NAME} preview image`,
} as const;

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

function withBrandTitle(title: string) {
  return title.includes(BUSINESS_NAME) ? title : `${title} | ${BUSINESS_NAME}`;
}

function toAbsoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl || pathOrUrl === "/") {
    return BUSINESS_SITE_URL;
  }

  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  return `${BUSINESS_SITE_URL}${normalizedPath}`;
}

export function getPageMetadata({
  title,
  description,
  path,
  canonical,
  keywords,
  type = "website",
}: PageMetadataOptions): Metadata {
  const brandedTitle = withBrandTitle(title);
  const canonicalUrl = toAbsoluteUrl(canonical ?? path);

  return {
    title: brandedTitle,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type,
      locale: "en_US",
      url: canonicalUrl,
      siteName: BUSINESS_NAME,
      title: brandedTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export function getSEOMetadata(page: string): Metadata {
  const config = SEO_MAP[page] ?? SEO_MAP.home;
  return getPageMetadata({
    title: config.title,
    description: config.description,
    canonical: config.canonical ?? BUSINESS_SITE_URL,
  });
}

export function getNoIndexMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    title: withBrandTitle(title),
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

// ─── Structured Data / JSON-LD ────────────────────────────────────────────────

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BUSINESS_NAME,
    url: BUSINESS_SITE_URL,
    description:
      "The Industrial-Grade Bidding Engine for NY Contractors. Trade-specific math, NYS tax compliance, and instant client dispatch.",
    audience: {
      "@type": "Audience",
      audienceType: "Contractors",
    },
    areaServed: BUSINESS_AREAS_SERVED,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BUSINESS_SITE_URL}/calculators?c={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getWebAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BUSINESS_NAME,
    url: BUSINESS_SITE_URL,
    description:
      "The Industrial-Grade Bidding Engine for NY Contractors. Trade-specific math, NYS tax compliance, and instant client dispatch.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web App, PWA",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    audience: {
      "@type": "Audience",
      audienceType: "Contractors",
    },
    areaServed: BUSINESS_AREAS_SERVED,
    creator: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      url: BUSINESS_SITE_URL,
    },
  };
}

export function getLocalBusinessSchema(
  reviews: VerifiedBusinessReview[] = VERIFIED_BUSINESS_REVIEWS,
) {
  const mappedReviews = reviews.map((review) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.authorName,
    },
    itemReviewed: {
      "@id": GOOGLE_BUSINESS_PROFILE_URL,
      "@type": "ProfessionalService",
      name: BUSINESS_NAME,
    },
    reviewBody: review.reviewBody,
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(review.ratingValue),
      bestRating: "5",
      worstRating: "1",
    },
    datePublished: review.datePublished,
    ...(review.url ? { url: review.url } : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": GOOGLE_BUSINESS_PROFILE_URL,
    name: BUSINESS_NAME,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "Google Business Profile CID",
      value: GOOGLE_BUSINESS_PROFILE_ID,
    },
    url: BUSINESS_SITE_URL,
    email: BUSINESS_EMAIL,
    sameAs: [GOOGLE_BUSINESS_PROFILE_URL],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rome",
      addressRegion: BUSINESS_STATE,
      addressCountry: BUSINESS_COUNTRY,
    },
    areaServed: BUSINESS_AREAS_SERVED,
    serviceArea: {
      "@type": "AdministrativeArea",
      name: BUSINESS_REGION,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: BUSINESS_EMAIL,
        areaServed: ["Oneida County, NY", "Madison County, NY", "Herkimer County, NY"],
        availableLanguage: "en",
        ...(BUSINESS_PHONE_E164 ? { telephone: BUSINESS_PHONE_E164 } : {}),
        ...(BUSINESS_WHATSAPP_URL ? { url: BUSINESS_WHATSAPP_URL } : {}),
      },
    ],
    hasMap: GOOGLE_BUSINESS_PROFILE_URL,
    ...(mappedReviews.length > 0 ? { review: mappedReviews } : {}),
  };
}

export function getVerifiedReviewSchema(
  reviews: VerifiedBusinessReview[] = VERIFIED_BUSINESS_REVIEWS,
) {
  if (reviews.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${BUSINESS_SITE_URL}/#verified-reviews`,
    name: BUSINESS_NAME,
    itemListElement: reviews.map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Review",
        itemReviewed: {
          "@id": GOOGLE_BUSINESS_PROFILE_URL,
          "@type": "ProfessionalService",
          name: BUSINESS_NAME,
        },
        author: {
          "@type": "Person",
          name: review.authorName,
        },
        reviewBody: review.reviewBody,
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(review.ratingValue),
          bestRating: "5",
          worstRating: "1",
        },
        datePublished: review.datePublished,
        ...(review.url ? { url: review.url } : {}),
      },
    })),
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
    url: `https://proconstructioncalc.com/blog/${post.slug}`,
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
    url: `${BUSINESS_SITE_URL}/field-notes/${article.slug}`,
    datePublished: article.date,
    author: { "@type": "Organization", name: BUSINESS_NAME },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      url: BUSINESS_SITE_URL,
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
