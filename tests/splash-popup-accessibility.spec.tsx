import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SplashPopup } from "@/components/ui/SplashPopup";

describe("SplashPopup accessibility", () => {
  it("renders with correct dialog attributes and descriptive close button aria-label", () => {
    const html = renderToStaticMarkup(<SplashPopup forceOpen />);

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="splash-title"');
    expect(html).toContain('aria-label="Close how-to guide popup"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
  });

  it("renders keyboard focus-visible ring styles on interactive links and buttons", () => {
    const html = renderToStaticMarkup(<SplashPopup forceOpen />);

    expect(html).toContain("Open How-To Guide");
    expect(html).toContain("Skip and open calculators");
    expect(html).toContain("Browse Field Notes →");
    const ringMatches = html.match(/focus-visible:ring-2/g) ?? [];
    // Close button, Open How-To Guide link, Skip button, Browse Field Notes link
    expect(ringMatches.length).toBeGreaterThanOrEqual(4);
  });
});
