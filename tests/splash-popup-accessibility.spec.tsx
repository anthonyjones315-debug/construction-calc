import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SplashPopup } from "@/components/ui/SplashPopup";

describe("SplashPopup accessibility", () => {
  it("renders modal dialog with accessible attributes and focus-visible close button", () => {
    // Render static HTML output of SplashPopup with forceOpen
    const html = renderToStaticMarkup(<SplashPopup forceOpen />);

    // Verify dialog container attributes
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="splash-title"');

    // Verify close button aria-label and focus ring styling
    expect(html).toContain('aria-label="Close guide modal"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
  });
});
