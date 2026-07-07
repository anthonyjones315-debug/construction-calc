import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "@/components/ui/glass-elements";

describe("ProInput accessibility", () => {
  it("renders as a label when it has no select options", () => {
    const html = renderToStaticMarkup(
      <ProInput
        label="Test Label"
        value={10}
        onChange={() => {}}
      />
    );

    expect(html).toContain("<label");
    expect(html).not.toContain("<fieldset");
    expect(html).not.toContain("<legend");
    expect(html).toContain("Test Label");
  });

  it("renders as a fieldset and legend when it has select options", () => {
    const html = renderToStaticMarkup(
      <ProInput
        label="Test Label"
        value={10}
        onChange={() => {}}
        unitSelectOptions={[
          { label: "Feet", value: "ft" },
          { label: "Inches", value: "in" },
        ]}
        unitSelectValue="ft"
      />
    );

    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).not.toContain("<label");
    expect(html).toContain("Test Label");
    expect(html).toContain("<select");
    expect(html).toContain("aria-label=\"Test Label unit\"");
    expect(html).toContain("aria-label=\"Test Label value\"");
  });
});
