import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProInput } from "../components/ui/ProInput";
import { FeetInchesInput } from "../components/ui/FeetInchesInput";

describe("Accessibility improvements", () => {
  it("ProInput uses fieldset and legend", () => {
    const html = renderToStaticMarkup(
      <ProInput
        label="Test Label"
        subLabel="Sub Label"
        helpText="Help Text"
        value="10"
        onChange={() => {}}
      />
    );

    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).toContain("aria-describedby");
    expect(html).toContain("-sublabel\"");
    expect(html).toContain("-helptext\"");
  });

  it("FeetInchesInput uses fieldset and legend with aria-describedby", () => {
    const html = renderToStaticMarkup(
      <FeetInchesInput
        label="Feet Label"
        subLabel="Sub Label"
        helpText="Help Text"
        value={10}
        onChange={() => {}}
      />
    );

    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).toContain("aria-describedby");
    expect(html).toContain("-sublabel\"");
    expect(html).toContain("-helptext\"");
  });
});
