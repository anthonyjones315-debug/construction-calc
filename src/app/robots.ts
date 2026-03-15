import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/calculators/"],
        disallow: ["/api/", "/dashboard/", "/auth/error"],
      },
      {
        userAgent: "CCBot",
        allow: ["/encyclopedia/", "/calculators/"],
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/encyclopedia/", "/calculators/"],
        disallow: ["/api/", "/dashboard/"],
      },
    ],
    sitemap: "https://proconstructioncalc.com/sitemap.xml",
  };
}
