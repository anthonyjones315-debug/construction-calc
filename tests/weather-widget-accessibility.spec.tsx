import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";

describe("WeatherWidget Accessibility", () => {
  it("renders a loading skeleton with role='status' and aria-label when loading forecast", () => {
    const html = renderToStaticMarkup(<WeatherWidget zip="13501" />);

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading 3-day weather forecast"');
    expect(html).toContain("animate-pulse");
  });

  it("returns null when no zip code is provided", () => {
    const html = renderToStaticMarkup(<WeatherWidget zip={null} />);

    expect(html).toBe("");
  });
});
