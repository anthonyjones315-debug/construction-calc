import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WelcomeGuidePopup } from "@/components/ui/WelcomeGuidePopup";

describe("WelcomeGuidePopup Accessibility", () => {
  it("renders with proper dialog attributes and focus-visible styling when forceOpen is true", () => {
    const html = renderToStaticMarkup(<WelcomeGuidePopup forceOpen={true} />);

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="welcome-guide-title"');
    expect(html).toContain('aria-label="Close welcome guide"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-blue-brand");
    expect(html).toContain("focus-visible:ring-offset-2");
  });
});
