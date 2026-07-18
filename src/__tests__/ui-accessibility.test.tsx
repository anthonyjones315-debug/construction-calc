import { describe, it, expect } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProInput } from "@/components/ui/glass-elements";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";

describe("UI Components Accessibility", () => {
  describe("ProInput Component", () => {
    it("renders a label element for a single input (non-composite)", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Single Field"
          value={10}
          onChange={() => {}}
          id="test-single"
        />
      );

      // Should contain label wrapper, and should not contain fieldset/legend
      expect(html).toContain("<label");
      expect(html).toContain('for="test-single"');
      expect(html).not.toContain("<fieldset");
      expect(html).not.toContain("<legend");
    });

    it("renders fieldset and legend in composite mode (when unitSelectOptions is present)", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Composite Field"
          value={10}
          onChange={() => {}}
          id="test-composite"
          unitSelectOptions={[
            { value: "in", label: "Inches" },
            { value: "ft", label: "Feet" },
          ]}
          unitSelectValue="ft"
        />
      );

      // Should use fieldset/legend and legend must contain standard mb-1 block w-full
      expect(html).toContain("<fieldset");
      expect(html).toContain('<legend class="mb-1 block w-full');
      expect(html).not.toContain("<label");
    });

    it("associates subLabel and helpText with controls using aria-describedby", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Described Field"
          subLabel="Optional extra context"
          helpText="This is a helper text"
          value={10}
          onChange={() => {}}
          id="test-desc"
        />
      );

      // Sub-label and help text must have IDs, and the input should have aria-describedby pointing to both
      expect(html).toContain('id="test-desc-sublabel"');
      expect(html).toContain('id="test-desc-helptext"');
      expect(html).toContain('aria-describedby="test-desc-sublabel test-desc-helptext"');
    });
  });

  describe("FeetInchesInput Component", () => {
    it("uses fieldset and legend, and associates subLabel/helpText with all inputs using aria-describedby", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          label="Slab Thickness"
          subLabel="Total height"
          helpText="Measure twice"
          value={12.5}
          onChange={() => {}}
          id="test-slab"
        />
      );

      // Should use fieldset and legend
      expect(html).toContain("<fieldset");
      expect(html).toContain('<legend class="mb-1 block w-full');

      // Sublabel and helper should have correct IDs
      expect(html).toContain('id="test-slab-sublabel"');
      expect(html).toContain('id="test-slab-helptext"');

      // The inner controls must have aria-describedby but MUST NOT have aria-labelledby
      expect(html).toContain('id="test-slab-ft"');
      expect(html).toContain('id="test-slab-in"');
      expect(html).toContain('id="test-slab-frac"');

      // Count occurrences of aria-describedby to ensure all 3 controls have it
      const countDescribedBy = (html.match(/aria-describedby="test-slab-sublabel test-slab-helptext"/g) || []).length;
      expect(countDescribedBy).toBe(3);

      // None of the inputs/selects should have aria-labelledby
      expect(html).not.toContain("aria-labelledby");
    });
  });
});
