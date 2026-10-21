import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/layout/Footer";

vi.mock("@routes", () => ({
  routes: {
    privacy: "/privacy",
    terms: "/terms",
  },
}));

vi.mock("@/lib/business-identity", () => ({
  BUSINESS_NAME: "Pro Construction Calc",
  BUSINESS_EMAIL: "support@proconstructioncalc.com",
}));

describe("Footer accessibility", () => {
  it("renders footer links with focus-visible ring styles", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/terms"');
    expect(html).toContain('href="mailto:support@proconstructioncalc.com"');
    expect(html).toContain("Cookie Preferences");

    // Verify focus-visible ring classes on links
    const focusVisibleMatches = html.match(/focus-visible:ring-2/g) ?? [];
    expect(focusVisibleMatches.length).toBeGreaterThanOrEqual(4);

    const ringColorMatches = html.match(/focus-visible:ring-\[--color-blue-brand\]/g) ?? [];
    expect(ringColorMatches.length).toBeGreaterThanOrEqual(4);
  });
});
