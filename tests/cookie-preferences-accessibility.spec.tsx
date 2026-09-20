import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";

describe("Cookie Preferences Accessibility", () => {
  it("renders CookiePreferencesButton as an accessible button with termly-display-preferences class", () => {
    const html = renderToStaticMarkup(<CookiePreferencesButton />);

    expect(html).toContain('<button type="button"');
    expect(html).toContain('aria-label="Manage cookie preferences"');
    expect(html).toContain("termly-display-preferences");
    expect(html).not.toContain('href="#"');
  });
});
