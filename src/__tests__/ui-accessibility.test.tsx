import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "@/components/ui/glass-elements";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";

describe("UI Accessibility Constraints", () => {
  describe("ProInput Component", () => {
    it("renders single inputs using a standard label to preserve native click-to-focus", () => {
      const html = renderToStaticMarkup(
        <ProInput
          id="test-single"
          label="Length"
          subLabel="In feet"
          helpText="Please enter a valid length"
          value="12"
          onChange={() => {}}
        />
      );

      // Should contain <label> with correct attributes
      expect(html).toContain('<label class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary" for="test-single"');
      expect(html).not.toContain("<fieldset");
      expect(html).not.toContain("<legend");

      // Verify aria-describedby associations for subLabel and helpText
      expect(html).toContain('id="test-single-sublabel"');
      expect(html).toContain('id="test-single-helptext"');
      expect(html).toContain('aria-describedby="test-single-sublabel test-single-helptext"');
    });

    it("renders composite fields (with unit select) using a fieldset and legend, omitting aria-labelledby on select", () => {
      const html = renderToStaticMarkup(
        <ProInput
          id="test-composite"
          label="Thickness"
          subLabel="In inches"
          helpText="Depth of the slab"
          value="4"
          onChange={() => {}}
          unitSelectValue="in"
          onUnitSelectChange={() => {}}
          unitSelectOptions={[
            { value: "in", label: "Inches" },
            { value: "ft", label: "Feet" },
          ]}
        />
      );

      // Should contain fieldset and legend
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");

      // Primary input should retain aria-labelledby to preserve accessible name from legend's label ID
      expect(html).toContain('aria-labelledby="test-composite-label"');

      // Secondary select should omit aria-labelledby and use an explicit aria-label to avoid redundant layout or name announcement
      expect(html).toContain('aria-label="Thickness unit"');
      expect(html.includes('<select aria-labelledby="test-composite-label"') || html.includes('aria-labelledby="test-composite-label"')).toBe(true);

      // Let's explicitly check that the select element itself does not have aria-labelledby
      const selectMatch = html.match(/<select[^>]*>/);
      expect(selectMatch).not.toBeNull();
      expect(selectMatch![0]).not.toContain("aria-labelledby");

      // Verify aria-describedby on composite input
      expect(html).toContain('aria-describedby="test-composite-sublabel test-composite-helptext"');
    });
  });

  describe("FeetInchesInput Component", () => {
    it("renders feet, inches, and fractional dropdown within fieldset/legend with omitted aria-labelledby and explicit aria-labels", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          id="test-feetinches"
          label="Slab Size"
          subLabel="Length of the area"
          helpText="Measure carefully"
          feet={10}
          inches={6}
          onFeetChange={() => {}}
          onInchesChange={() => {}}
        />
      );

      // Must use fieldset and legend grouping
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");

      // Interactive controls must omit aria-labelledby completely
      const inputs = html.match(/<input[^>]*>/g) || [];
      expect(inputs.length).toBeGreaterThan(0);
      for (const input of inputs) {
        expect(input).not.toContain("aria-labelledby");
      }

      const selects = html.match(/<select[^>]*>/g) || [];
      expect(selects.length).toBeGreaterThan(0);
      for (const select of selects) {
        expect(select).not.toContain("aria-labelledby");
      }

      // Must have descriptive explicit aria-labels
      expect(html).toContain('aria-label="Slab Size feet"');
      expect(html).toContain('aria-label="Slab Size inches"');
      expect(html).toContain('aria-label="Slab Size fractional inches"');

      // Verify aria-describedby associations for subLabel and helpText on all interactive controls
      for (const input of inputs) {
        expect(input).toContain('aria-describedby="test-feetinches-sublabel test-feetinches-helptext"');
      }
      for (const select of selects) {
        expect(select).toContain('aria-describedby="test-feetinches-sublabel test-feetinches-helptext"');
      }
    });
  });
});
