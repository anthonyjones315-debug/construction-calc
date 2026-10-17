import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WelcomeGuidePopup } from "@/components/ui/WelcomeGuidePopup";

describe("WelcomeGuidePopup Accessibility & Micro-UX", () => {
  it("renders accessible modal dialog markup with focus-visible ring styles", () => {
    const html = renderToStaticMarkup(<WelcomeGuidePopup forceOpen />);

    // Dialog ARIA attributes
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="welcome-guide-title"');
    expect(html).toContain('id="welcome-guide-title"');

    // Close button accessibility
    expect(html).toContain('aria-label="Close welcome guide"');

    // Explicit aria-hidden="true" on backdrop overlay
    expect(html).toContain('aria-hidden="true"');

    // Focus-visible ring styling for keyboard navigation
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-blue-brand");

    // Content verification
    expect(html).toContain("Your guide is ready");
    expect(html).toContain("Open Welcome Guide");
    expect(html).toContain("Go to Command Center");
    expect(html).toContain("Close for now");
    expect(html).toContain("Don&#x27;t show this popup again");
  });
});
