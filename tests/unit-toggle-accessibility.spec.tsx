import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { UnitToggle } from "@/app/calculators/_components/UnitToggle";

describe("UnitToggle Accessibility", () => {
  it("renders with role='group' and aria-labelledby attribute pairing", () => {
    const html = renderToStaticMarkup(
      <UnitToggle
        label="Length Unit"
        value="feet"
        options={[
          { value: "feet", label: "Feet" },
          { value: "meters", label: "Meters" },
        ]}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('role="group"');
    expect(html).toContain('id="unit-toggle-label-');
    expect(html).toContain('aria-labelledby="unit-toggle-label-');
  });

  it("sets aria-pressed and includes focus-visible styling on buttons", () => {
    const html = renderToStaticMarkup(
      <UnitToggle
        label="Measurement Mode"
        value="imperial"
        options={[
          { value: "imperial", label: "Imperial" },
          { value: "metric", label: "Metric" },
        ]}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
  });
});
