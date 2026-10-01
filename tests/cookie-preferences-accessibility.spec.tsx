import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";

describe("CookiePreferencesButton accessibility", () => {
  it("renders a semantic button element with aria-label, focus-visible styling, and termly class", () => {
    const html = renderToStaticMarkup(<CookiePreferencesButton />);

    expect(html).toContain('<button type="button"');
    expect(html).toContain('aria-label="Open cookie preferences"');
    expect(html).toContain("termly-display-preferences");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).not.toContain('<a href="#"');
  });
});
