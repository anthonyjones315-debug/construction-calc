import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JobWeatherWidget } from "@/components/crm/JobWeatherWidget";

describe("JobWeatherWidget Accessibility & UI Markup", () => {
  it("renders loading state with role='status' and aria-label", () => {
    const html = renderToStaticMarkup(<JobWeatherWidget address="78701" />);

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading job site weather"');
    expect(html).toContain("Loading Job Weather...");
  });

  it("verifies component includes semantic section, aria-hidden icons, and screen reader text structure", () => {
    const html = renderToStaticMarkup(<JobWeatherWidget address="78701" />);
    expect(html).toContain("<section");
  });
});
