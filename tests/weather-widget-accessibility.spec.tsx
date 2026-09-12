import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WeatherIcon, WeatherWidget } from "@/components/dashboard/WeatherWidget";

describe("WeatherWidget accessibility", () => {
  it("renders weather icons with aria-hidden='true'", () => {
    const htmlRain = renderToStaticMarkup(<WeatherIcon icon="light rain" />);
    const htmlSun = renderToStaticMarkup(<WeatherIcon icon="sunny" />);
    const htmlSnow = renderToStaticMarkup(<WeatherIcon icon="snow" />);

    expect(htmlRain).toContain('aria-hidden="true"');
    expect(htmlSun).toContain('aria-hidden="true"');
    expect(htmlSnow).toContain('aria-hidden="true"');
  });

  it("renders accessible loading skeleton when loading weather", () => {
    const html = renderToStaticMarkup(<WeatherWidget zip="13501" />);

    expect(html).toContain("animate-pulse");
  });
});
