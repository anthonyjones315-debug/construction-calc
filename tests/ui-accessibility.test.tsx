import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "@/components/ui/glass-elements";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";

describe("UI Accessibility Patterns", () => {
  describe("ProInput accessibility", () => {
    it("renders as a simple <label> when there are no unit select options", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Length"
          value="10"
          onChange={() => {}}
          id="test-length"
        />,
      );

      expect(html).toContain('<label class="');
      expect(html).toContain('for="test-length"');
      expect(html).not.toContain("<fieldset");
      expect(html).not.toContain("<legend");

      // Check input id and aria-labelledby
      expect(html).toContain('id="test-length"');
      expect(html).toContain('aria-labelledby="test-length-label"');
    });

    it("renders as a <fieldset> with <legend> in composite mode (has unit select options)", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Length"
          value="10"
          onChange={() => {}}
          id="test-length-composite"
          unitSelectOptions={[
            { value: "ft", label: "Feet" },
            { value: "in", label: "Inches" },
          ]}
          unitSelectValue="ft"
          onUnitSelectChange={() => {}}
        />,
      );

      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");
      expect(html).not.toContain("<label");

      // Primary input has aria-labelledby
      expect(html).toContain('aria-labelledby="test-length-composite-label"');

      // Secondary select has an explicit aria-label but NOT aria-labelledby
      expect(html).toContain('aria-label="Length unit"');
      expect(html).not.toContain('<select aria-labelledby="test-length-composite-label"');
    });

    it("associates subLabel and helpText via aria-describedby on the main input", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Length"
          subLabel="In feet"
          helpText="Enter the total length"
          value="10"
          onChange={() => {}}
          id="test-desc"
        />,
      );

      expect(html).toContain('id="test-desc-sublabel"');
      expect(html).toContain('id="test-desc-helptext"');
      expect(html).toContain('aria-describedby="test-desc-sublabel test-desc-helptext"');
    });
  });

  describe("FeetInchesInput accessibility", () => {
    it("renders as a <fieldset> with a <legend> and does not have aria-labelledby on sub-controls", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          label="Slab Size"
          value={12.5}
          onChange={() => {}}
          id="test-feet-inches"
        />,
      );

      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");

      // Verify each sub-control has individual aria-label but NOT aria-labelledby
      expect(html).toContain('aria-label="Slab Size feet"');
      expect(html).toContain('aria-label="Slab Size inches"');
      expect(html).toContain('aria-label="Slab Size fractional inches"');
      expect(html).not.toContain('aria-labelledby="test-feet-inches-label"');
    });

    it("associates subLabel and helpText with all sub-controls via aria-describedby", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          label="Slab Size"
          subLabel="Total width"
          helpText="Width of the concrete slab"
          value={12.5}
          onChange={() => {}}
          id="test-feet-inches-desc"
        />,
      );

      expect(html).toContain('id="test-feet-inches-desc-sublabel"');
      expect(html).toContain('id="test-feet-inches-desc-helptext"');

      // The feet input, inches input, and fractional select should all have aria-describedby pointing to descriptions
      const occurrences = (html.match(/aria-describedby="test-feet-inches-desc-sublabel test-feet-inches-desc-helptext"/g) || []);
      expect(occurrences.length).toBe(3);
    });
  });
});
