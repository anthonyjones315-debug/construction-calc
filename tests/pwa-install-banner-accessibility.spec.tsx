import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PWAInstallBanner } from "@/components/layout/PWAInstallBanner";

describe("PWAInstallBanner accessibility", () => {
  it("renders as a semantic <aside> landmark with descriptive aria-label", () => {
    const html = renderToStaticMarkup(<PWAInstallBanner forceVisible />);

    expect(html).toContain("<aside");
    expect(html).not.toContain('role="banner"');
    expect(html).toContain('aria-label="Install Pro Construction Calc"');
  });

  it("includes focus-visible ring styles and accessible dismiss button labels", () => {
    const html = renderToStaticMarkup(<PWAInstallBanner forceVisible />);

    expect(html).toContain('aria-label="Dismiss install banner"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-white");
    expect(html).toContain("focus-visible:outline-none");
  });
});
