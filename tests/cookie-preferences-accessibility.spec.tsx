import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";

describe("CookiePreferences accessibility", () => {
  it("renders CookiePreferencesButton as an accessible button with ARIA label and termly class", () => {
    const html = renderToStaticMarkup(<CookiePreferencesButton />);

    expect(html).toContain("<button");
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="Open cookie preferences dialog"');
    expect(html).toContain("termly-display-preferences");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).not.toContain("<a ");
  });
});
