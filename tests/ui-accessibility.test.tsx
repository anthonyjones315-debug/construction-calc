import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "@/components/ui/glass-elements";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";

describe("UI Accessibility patterns", () => {
  describe("ProInput accessibility", () => {
    it("renders single inputs inside a label for click-to-focus and sets aria-describedby", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Single Input"
          subLabel="Optional sub"
          helpText="Some helper text"
          value="45"
          onChange={() => {}}
        />,
      );

      // Single mode should be wrapped in a <label> (not fieldset) to preserve click-to-focus
      expect(html).toContain("<label");
      expect(html).not.toContain("<fieldset");
      expect(html).not.toContain("<legend");

      // Verify IDs and aria-describedby mapping robustly using regex
      const sublabelIdMatch = html.match(/id="([^"]+-sublabel)"/);
      const helpIdMatch = html.match(/id="([^"]+-help)"/);
      expect(sublabelIdMatch).not.toBeNull();
      expect(helpIdMatch).not.toBeNull();

      const sublabelId = sublabelIdMatch![1];
      const helpId = helpIdMatch![1];
      expect(html).toContain(`aria-describedby="${sublabelId} ${helpId}"`);
    });

    it("renders composite inputs inside a fieldset/legend and omits redundant labels", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Composite Input"
          value="10"
          onChange={() => {}}
          unitSelectOptions={[
            { value: "ft", label: "Feet" },
            { value: "m", label: "Meters" },
          ]}
          unitSelectValue="ft"
          onUnitSelectChange={() => {}}
        />,
      );

      // Composite mode should use fieldset/legend
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");
      expect(html).not.toContain("<label");

      // Primary input must retain aria-labelledby referencing the legend's ID
      const labelIdMatch = html.match(/id="([^"]+-label)"/);
      expect(labelIdMatch).not.toBeNull();
      const labelId = labelIdMatch![1];
      expect(html).toContain(`aria-labelledby="${labelId}"`);

      // Secondary select must omit aria-labelledby and use aria-label
      expect(html).toContain('aria-label="Composite Input unit"');
      expect(html).not.toContain('<select aria-labelledby');
    });
  });

  describe("FeetInchesInput accessibility", () => {
    it("renders as fieldset/legend with descriptive subLabel/helpText mapping", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          label="Total Depth"
          subLabel="In inches"
          helpText="Minimum 4 inches"
          value={1.5}
          onChange={() => {}}
        />,
      );

      // Group should use fieldset/legend
      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");

      // Interactive sub-inputs must omit aria-labelledby to avoid overriding explicit aria-labels
      expect(html).not.toContain('aria-labelledby="');

      // Verify specific aria-labels exist
      expect(html).toContain('aria-label="Total Depth feet"');
      expect(html).toContain('aria-label="Total Depth inches"');
      expect(html).toContain('aria-label="Total Depth fractional inches"');

      // Verify subLabel and helpText ids and aria-describedby associations robustly using regex
      const sublabelIdMatch = html.match(/id="([^"]+-sublabel)"/);
      const helpIdMatch = html.match(/id="([^"]+-help)"/);
      expect(sublabelIdMatch).not.toBeNull();
      expect(helpIdMatch).not.toBeNull();

      const sublabelId = sublabelIdMatch![1];
      const helpId = helpIdMatch![1];
      expect(html).toContain(`aria-describedby="${sublabelId} ${helpId}"`);
    });
  });
});
