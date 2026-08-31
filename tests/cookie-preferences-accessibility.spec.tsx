import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";

describe("CookiePreferencesButton accessibility", () => {
  it("renders a semantic button element with proper ARIA label and Termly class", () => {
    const html = renderToStaticMarkup(<CookiePreferencesButton />);

    expect(html).toContain('<button type="button"');
    expect(html).toContain('aria-label="Manage cookie preferences"');
    expect(html).toContain('class="termly-display-preferences');
    expect(html).toContain("Cookie Preferences</button>");
    expect(html).not.toContain('<a href="#"');
  });
});
