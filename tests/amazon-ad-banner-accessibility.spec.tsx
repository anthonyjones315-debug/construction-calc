import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AmazonAdBanner } from "@/components/layout/AmazonAdBanner";

describe("AmazonAdBanner accessibility", () => {
  it("renders signin variant with focus-visible ring styles and descriptive aria-labels", () => {
    const html = renderToStaticMarkup(<AmazonAdBanner variant="signin" />);

    expect(html).toContain("Contractor Gear");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
    expect(html).toContain('aria-label="Laser Measures - Instant room &amp; span dims (opens on Amazon in a new tab)"');
    expect(html).toContain('aria-label="Browse all contractor tools on Amazon (opens in a new tab)"');
  });

  it("renders home variant with focus-visible ring styles and descriptive aria-labels", () => {
    const html = renderToStaticMarkup(<AmazonAdBanner variant="home" />);

    expect(html).toContain("Shop Contractor Gear");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
    expect(html).toContain('aria-label="Laser Measures - Instant room &amp; span dims (opens on Amazon in a new tab)"');
    expect(html).toContain('aria-label="Browse all contractor tools on Amazon (opens in a new tab)"');
  });
});
