import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "@/components/ui/glass-elements";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";

describe("UI Accessibility Patterns", () => {
  describe("ProInput", () => {
    it("renders single inputs with label container, retaining native click-to-focus", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Slab Length"
          subLabel="Length of the area"
          helpText="Enter the total length in feet"
          value={12}
          onChange={() => {}}
          id="test-single-input"
        />,
      );

      // Verify label container with correct htmlFor
      expect(html).toContain("<label");
      expect(html).toContain('for="test-single-input"');
      expect(html).toContain('id="test-single-input"');

      // Verify aria-describedby links to subLabel and helpText
      expect(html).toContain('id="test-single-input-sublabel"');
      expect(html).toContain('id="test-single-input-helptext"');
      expect(html).toContain('aria-describedby="test-single-input-sublabel test-single-input-helptext"');

      // Verify input elements have correct aria-labelledby
      expect(html).toContain('aria-labelledby="test-single-input-label"');
      expect(html).not.toContain("<fieldset");
    });

    it("renders composite inputs with fieldset/legend container and proper ARIA layout", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Thickness"
          subLabel="Depth of slab"
          helpText="Select units and input value"
          value={4}
          onChange={() => {}}
          unitSelectOptions={[
            { label: "inches", value: "in" },
            { label: "feet", value: "ft" },
          ]}
          unitSelectValue="in"
          onUnitSelectChange={() => {}}
          id="test-composite-input"
        />,
      );

      // Verify fieldset and legend structure
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");
      expect(html).not.toContain('for="test-composite-input"');

      // Verify primary input retains aria-labelledby
      expect(html).toContain('id="test-composite-input"');
      expect(html).toContain('aria-labelledby="test-composite-input-label"');

      // Verify secondary select omits aria-labelledby but has aria-label
      expect(html).toContain('aria-label="Thickness unit"');

      // Since only the primary input should have aria-labelledby, the overall HTML should contain exactly one match
      const ariaLabelledByMatches = html.match(/aria-labelledby/g) || [];
      expect(ariaLabelledByMatches.length).toBe(1);

      // Verify aria-describedby associations for both interactive elements
      expect(html).toContain('id="test-composite-input-sublabel"');
      expect(html).toContain('id="test-composite-input-helptext"');
      expect(html).toContain('aria-describedby="test-composite-input-sublabel test-composite-input-helptext"');
    });
  });

  describe("FeetInchesInput", () => {
    it("renders with fieldset/legend container and interactive elements that omit aria-labelledby", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          label="Slab Thickness"
          subLabel="Total thickness"
          helpText="Specify feet, inches and fraction"
          value={12.5}
          onChange={() => {}}
          id="test-feet-inches"
        />,
      );

      // Verify fieldset/legend
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");

      // Verify descriptions exist with proper IDs
      expect(html).toContain('id="test-feet-inches-sublabel"');
      expect(html).toContain('id="test-feet-inches-helptext"');

      // Verify all interactive elements omit aria-labelledby
      expect(html).not.toContain('id="test-feet-inches-ft" aria-labelledby');
      expect(html).not.toContain('id="test-feet-inches-in" aria-labelledby');
      expect(html).not.toContain('id="test-feet-inches-frac" aria-labelledby');

      // Verify all interactive elements have correct aria-label and aria-describedby
      expect(html).toContain('aria-label="Slab Thickness feet"');
      expect(html).toContain('aria-label="Slab Thickness inches"');
      expect(html).toContain('aria-label="Slab Thickness fractional inches"');
      expect(html).toContain('aria-describedby="test-feet-inches-sublabel test-feet-inches-helptext"');
    });
  });
});
