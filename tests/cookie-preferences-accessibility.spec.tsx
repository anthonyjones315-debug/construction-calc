import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";

describe("CookiePreferencesButton component accessibility", () => {
  it("renders a semantic button element with proper ARIA attributes, termly class, and focus ring", () => {
    const html = renderToStaticMarkup(<CookiePreferencesButton />);

    expect(html).toContain('<button type="button"');
    expect(html).toContain('aria-label="Manage cookie preferences"');
    expect(html).toContain("termly-display-preferences");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("Cookie Preferences</button>");
  });
});
