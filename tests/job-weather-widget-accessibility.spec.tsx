import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JobWeatherWidget } from "@/components/crm/JobWeatherWidget";

describe("JobWeatherWidget Accessibility", () => {
  it("renders loading state with accessible region role and label", () => {
    const html = renderToStaticMarkup(<JobWeatherWidget address="78701" />);
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Loading job weather"');
    expect(html).toContain("Loading Job Weather...");
  });
});
