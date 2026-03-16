import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pro Construction Calc",
    short_name: "PCC",
    description:
      "Professional construction estimating calculators for contractors, including trade-specific quantity math, cost planning, and client-ready estimate exports.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

