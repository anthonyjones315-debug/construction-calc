import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "@/components/ui/glass-elements";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";

describe("UI Accessibility - ProInput and FeetInchesInput", () => {
  describe("ProInput", () => {
    it("renders as <fieldset> and <legend> when composite (has unit select options)", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Test Label"
          value="10"
          onChange={() => {}}
          unitSelectOptions={[{ value: "in", label: "Inches" }]}
          unitSelectValue="in"
          onUnitSelectChange={() => {}}
        />
      );

      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");
      // Select should have aria-label and omit aria-labelledby
      expect(html).toContain('aria-label="Test Label unit"');
      expect(html).not.toContain('<select aria-labelledby=');
    });

    it("renders as a standard <label> for single inputs", () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Test Label"
          value="10"
          onChange={() => {}}
        />
      );

      expect(html).toContain("<label");
      expect(html).not.toContain("<fieldset");
      expect(html).not.toContain("<legend");
    });

    it("associates subLabel and helpText with controls using aria-describedby", () => {
      const html = renderToStaticMarkup(
        <ProInput
          id="custom-pro-id"
          label="Test Label"
          subLabel="This is a sublabel"
          helpText="This is a help text"
          value="10"
          onChange={() => {}}
        />
      );

      expect(html).toContain('id="custom-pro-id-sublabel"');
      expect(html).toContain('id="custom-pro-id-help"');
      expect(html).toContain('aria-describedby="custom-pro-id-sublabel custom-pro-id-help"');
    });
  });

  describe("FeetInchesInput", () => {
    it("renders as <fieldset> and <legend>", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          label="Length Input"
          value={10}
          onChange={() => {}}
        />
      );

      expect(html).toContain("<fieldset");
      expect(html).toContain("<legend");
    });

    it("omits aria-labelledby from interactive elements to prevent group label override", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          label="Length Input"
          value={10}
          onChange={() => {}}
        />
      );

      // Verify that individual inputs and selects do not have aria-labelledby
      expect(html).not.toContain('aria-labelledby=');
    });

    it("associates subLabel and helpText with inputs using aria-describedby", () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          id="custom-feet-id"
          label="Length Input"
          subLabel="In feet and inches"
          helpText="Please enter positive values"
          value={10}
          onChange={() => {}}
        />
      );

      expect(html).toContain('id="custom-feet-id-sublabel"');
      expect(html).toContain('id="custom-feet-id-help"');
      // Should have aria-describedby associated with the input fields
      expect(html).toContain('aria-describedby="custom-feet-id-sublabel custom-feet-id-help"');
    });
  });
});
