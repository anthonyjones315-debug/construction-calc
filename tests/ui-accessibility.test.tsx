import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "@/components/ui/glass-elements";
import { FeetInchesInput } from "@/components/ui/FeetInchesInput";

describe("UI components accessibility compliance", () => {
  it("renders ProInput as a label with aria-describedby when not composite", () => {
    const html = renderToStaticMarkup(
      <ProInput
        label="Single Input Label"
        value={12}
        onChange={() => {}}
        subLabel="sublabel-desc"
        helpText="helptext-desc"
        id="single-input"
      />
    );

    // Should render label wrapper with htmlFor pointing to the input id
    expect(html).toContain('<label class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary" for="single-input"');

    // Check aria-describedby on input
    expect(html).toContain('aria-describedby="single-input-sublabel single-input-help"');

    // Check subLabel has id
    expect(html).toContain('id="single-input-sublabel"');

    // Check helpText has id
    expect(html).toContain('id="single-input-help"');
  });

  it("renders ProInput as a fieldset/legend with aria-describedby when composite", () => {
    const html = renderToStaticMarkup(
      <ProInput
        label="Composite Input Label"
        value={12}
        onChange={() => {}}
        subLabel="sublabel-desc"
        helpText="helptext-desc"
        id="composite-input"
        unitSelectOptions={[
          { value: "in", label: "Inches" },
          { value: "ft", label: "Feet" },
        ]}
        unitSelectValue="in"
        onUnitSelectChange={() => {}}
      />
    );

    // Wrapper should be fieldset instead of label
    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).not.toContain('for="composite-input"');

    // Input must retain aria-labelledby referencing the legend's ID
    expect(html).toContain('aria-labelledby="composite-input-label"');

    // Input should have aria-describedby
    expect(html).toContain('aria-describedby="composite-input-sublabel composite-input-help"');

    // Select must omit aria-labelledby and use an explicit aria-label
    expect(html).toContain('aria-label="Composite Input Label unit"');
    expect(html).not.toContain('<select aria-labelledby');
  });

  it("renders FeetInchesInput as fieldset with aria-describedby and omits aria-labelledby on interactive elements", () => {
    const html = renderToStaticMarkup(
      <FeetInchesInput
        label="Measurement Field"
        value={5.5}
        onChange={() => {}}
        subLabel="sublabel-desc"
        helpText="helptext-desc"
        id="feet-inches-input"
      />
    );

    // Wrapper is fieldset/legend
    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");

    // All interactive inputs/selects should have aria-describedby pointing to subLabel and helpText
    const expectedDescribedBy = 'aria-describedby="feet-inches-input-sublabel feet-inches-input-help"';
    const describedByMatches = html.match(new RegExp(expectedDescribedBy, "g")) || [];
    // Should be applied to all three: feet input, inches input, fraction select
    expect(describedByMatches.length).toBe(3);

    // All interactive inputs/selects must omit aria-labelledby
    expect(html).not.toContain('aria-labelledby="feet-inches-input-label"');
  });
});
