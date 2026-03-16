import type { MetadataRoute } from "next";
import { FIELD_NOTES } from "@/data/field-notes";
import { BLOG_POSTS } from "@/data/blog";

const BASE = "https://proconstructioncalc.com";

// Main calculator entry points and trade/category routes.
const CALCULATOR_PATHS: string[] = [
  "/calculators",
  "/calculators/concrete",
  "/calculators/concrete/slab",
  "/calculators/concrete/footing",
  "/calculators/concrete/block",
  "/calculators/concrete/block-wall",
  "/calculators/framing",
  "/calculators/framing/wall",
  "/calculators/framing/floor",
  "/calculators/framing/roof",
  "/calculators/framing/wall-studs",
  "/calculators/framing/headers",
  "/calculators/framing/rafters",
  "/calculators/framing/rafter-length",
  "/calculators/framing/deck-joists",
  "/calculators/decking",
  "/calculators/roofing",
  "/calculators/roofing/shingles",
  "/calculators/roofing/shingle-bundles",
  "/calculators/roofing/pitch",
  "/calculators/roofing/pitch-slope",
  "/calculators/roofing/siding",
  "/calculators/roofing/siding-squares",
  "/calculators/mechanical",
  "/calculators/mechanical/btu-estimator",
  "/calculators/mechanical/ventilation-calc",
  "/calculators/mechanical/drywall-sheets",
  "/calculators/insulation",
  "/calculators/insulation/r-value",
  "/calculators/insulation/r-value-tracker",
  "/calculators/insulation/drywall",
  "/calculators/insulation/drywall-sheets",
  "/calculators/insulation/duct-sizing",
  "/calculators/finish",
  "/calculators/finish/trim",
  "/calculators/finish/flooring",
  "/calculators/finish/stairs",
  "/calculators/interior",
  "/calculators/interior/trim-baseboard",
  "/calculators/interior/flooring-waste",
  "/calculators/interior/paint-gal",
  "/calculators/interior/stair-stringers",
  "/calculators/management",
  "/calculators/management/margin",
  "/calculators/management/labor",
  "/calculators/management/leads",
  "/calculators/business",
  "/calculators/business/profit-margin",
  "/calculators/business/labor-rate",
  "/calculators/business/lead-estimator",
  "/calculators/business/tax-save",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/field-notes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/financial-terms`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const calculatorPages: MetadataRoute.Sitemap = CALCULATOR_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const fieldNotesPages: MetadataRoute.Sitemap = FIELD_NOTES.flatMap((note) => {
    const fieldNotesEntry = {
      url: `${BASE}/field-notes/${note.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
    const blogAliasEntry = {
      url: `${BASE}/blog/${note.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
    return [fieldNotesEntry, blogAliasEntry];
  });

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.flatMap((post) => {
    const blogEntry = {
      url: `${BASE}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
    const fieldNotesAliasEntry = {
      url: `${BASE}/field-notes/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
    return [blogEntry, fieldNotesAliasEntry];
  });

  return [...staticPages, ...calculatorPages, ...fieldNotesPages, ...blogPages];
}
