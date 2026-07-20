import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";
import { ProInput } from "@/components/ui/ProInput";

describe("UI Accessibility — ProInput and FeetInchesInput", () => {
  describe("FeetInchesInput", () => {
    it("uses <fieldset> and <legend> with correct semantic structures", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          id="test-dim"
          label="Test Dimension"
          subLabel="Optional Subtitle"
          helpText="This is a guideline help text"
          value={10.5}
          onChange={() => {}}
        />,
      );

      // Check fieldset and legend are present
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");

      // Verify sublabel and helpText have corresponding IDs
      expect(html).toContain('id="test-dim-sublabel"');
      expect(html).toContain('id="test-dim-helptext"');

      // Verify elements omit aria-labelledby to avoid group overrides
      // and use explicit aria-label and aria-describedby
      expect(html).not.toContain('aria-labelledby="test-dim-label"');
      expect(html).toContain('aria-describedby="test-dim-sublabel test-dim-helptext"');
      expect(html).toContain('aria-label="Test Dimension feet"');
      expect(html).toContain('aria-label="Test Dimension inches"');
      expect(html).toContain('aria-label="Test Dimension fractional inches"');
    });
  });

  describe("ProInput", () => {
    it("renders as <label> for single inputs to preserve native click-to-focus", () => {
      const html = renderToStaticMarkup(
        <ProInput
          id="test-slab"
          label="Slab Area"
          subLabel="sq ft"
          helpText="Enter the total slab area"
          value={150}
          onChange={() => {}}
        />,
      );

      // Verify it renders as label, not fieldset
      expect(html).toContain("<label");
      expect(html).not.toContain("<fieldset");
      expect(html).not.toContain("<legend");

      // Verify sublabel and helptext IDs are present
      expect(html).toContain('id="test-slab-sublabel"');
      expect(html).toContain('id="test-slab-helptext"');

      // Verify input associates with label via aria-labelledby and describes via aria-describedby
      expect(html).toContain('aria-labelledby="test-slab-label"');
      expect(html).toContain('aria-describedby="test-slab-sublabel test-slab-helptext"');
    });

    it("renders as <fieldset> and <legend> in composite mode (has select options)", () => {
      const html = renderToStaticMarkup(
        <ProInput
          id="test-vol"
          label="Concrete Volume"
          value={5}
          onChange={() => {}}
          unitSelectOptions={[
            { label: "Yards", value: "yd" },
            { label: "Meters", value: "m" },
          ]}
          unitSelectValue="yd"
          onUnitSelectChange={() => {}}
        />,
      );

      // Verify it renders as fieldset/legend
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");
      expect(html).not.toContain("<label");

      // Verify primary input retains aria-labelledby to preserve accessible name from legend's label
      expect(html).toContain('aria-labelledby="test-vol-label"');

      // Verify secondary select omits aria-labelledby and uses an explicit aria-label
      expect(html).toContain('aria-label="Concrete Volume unit"');
      expect(html).not.toContain('<select aria-labelledby=');
    });
  });
});
