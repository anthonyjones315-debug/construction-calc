import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "./glass-elements";

describe("ProInput Accessibility", () => {
  it("renders as a label when no select options are provided", () => {
    const html = renderToStaticMarkup(
      <ProInput
        label="Test Label"
        value="10"
        onChange={() => {}}
      />
    );

    // It should be a label wrapping the input
    expect(html).toContain("<label");
    expect(html).toContain("Test Label");
    expect(html).toContain("type=\"number\"");
    expect(html).toContain("value=\"10\"");
    // Should NOT have fieldset or legend
    expect(html).not.toContain("<fieldset");
    expect(html).not.toContain("<legend");
  });

  it("renders as a fieldset with legend when select options are provided", () => {
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
    expect(html).toContain("Test Label");

    // The input should have an aria-label because it's in a fieldset
    expect(html).toContain("aria-label=\"Test Label value\"");

    // The select should have an aria-label
    expect(html).toContain("aria-label=\"Test Label unit\"");
  });
});
