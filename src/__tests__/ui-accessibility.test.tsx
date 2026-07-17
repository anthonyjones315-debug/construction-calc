import { describe, it, expect } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProInput } from "@/components/ui/glass-elements";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";

describe("UI Components Accessibility & Semantic Markup", () => {
  describe("ProInput", () => {
    it("renders with standard <label> for a single input (no unit select options)", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Single Label"
          value="42"
          onChange={() => {}}
          unitSuffix="pcs"
        />
      );

      // Should contain <label> wrapper, not <fieldset>
      expect(html).toContain("<label");
      expect(html).not.toContain("<fieldset");
      expect(html).not.toContain("<legend");
      expect(html).toContain("pcs");
    });

    it("renders with <fieldset> and <legend> in composite mode (when unitSelectOptions are provided)", () => {
      const options = [
        { value: "ft", label: "Feet" },
        { value: "m", label: "Meters" },
      ];
      const html = renderToStaticMarkup(
        <ProInput
          label="Composite Label"
          value="10"
          onChange={() => {}}
          unitSelectOptions={options}
          unitSelectValue="ft"
          onUnitSelectChange={() => {}}
        />
      );

      // Should use <fieldset> and <legend> with proper classes for layout consistency
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");
      expect(html).toContain("mb-1 block w-full");
      expect(html).toContain("Composite Label");
      expect(html).not.toContain("<label");
    });

    it("associates subLabel and helpText using aria-describedby", () => {
      const html = renderToStaticMarkup(
        <ProInput
          id="test-input"
          label="Label"
          subLabel="This is subLabel"
          helpText="This is helpText"
          value="10"
          onChange={() => {}}
        />
      );

      // The subLabel and helpText should have specific IDs
      expect(html).toContain('id="test-input-sublabel"');
      expect(html).toContain('id="test-input-helptext"');

      // The input should have aria-describedby referencing these IDs
      expect(html).toContain('aria-describedby="test-input-sublabel test-input-helptext"');
    });
  });

  describe("FeetInchesInput", () => {
    it("renders correctly with fieldset and legend, omitting aria-labelledby on interactive children", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          id="test-feet"
          label="Length Input"
          value="12.5"
          onChange={() => {}}
        />
      );

      // Should use <fieldset> and <legend>
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");

      // Internal inputs/select must omit aria-labelledby to avoid overriding descriptive aria-labels
      expect(html).not.toContain("aria-labelledby");

      // Internal fields must have descriptive aria-labels
      expect(html).toContain('aria-label="Length Input feet"');
      expect(html).toContain('aria-label="Length Input inches"');
      expect(html).toContain('aria-label="Length Input fractional inches"');
    });

    it("associates subLabel and helpText via aria-describedby on all interactive children", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          id="test-feet-desc"
          label="Width Input"
          subLabel="Inside span"
          helpText="Field help text"
          value="5"
          onChange={() => {}}
        />
      );

      // Ensure IDs are generated
      expect(html).toContain('id="test-feet-desc-sublabel"');
      expect(html).toContain('id="test-feet-desc-helptext"');

      // Check that all interactive fields reference the description elements
      const occurrences = html.split('aria-describedby="test-feet-desc-sublabel test-feet-desc-helptext"').length - 1;
      // Should be on feet input, inches input, and fractional select
      expect(occurrences).toBe(3);
    });
  });
});
