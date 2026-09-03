import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProInput } from "@/components/ui/glass-elements";

describe("ProInput accessibility", () => {
  it("associates label and aria-describedby for subLabel and helpText correctly", () => {
    const html = renderToStaticMarkup(
      <ProInput
        id="length-input"
        label="Length"
        subLabel="In feet"
        helpText="Enter total length needed"
        value="10"
        onChange={() => {}}
      />
    );

    expect(html).toContain('id="length-input-label"');
    expect(html).toContain('aria-labelledby="length-input-label"');
    expect(html).toContain('aria-describedby="length-input-sublabel length-input-helptext"');
    expect(html).toContain('id="length-input-sublabel"');
    expect(html).toContain('id="length-input-helptext"');
  });

  it("omits aria-describedby when subLabel and helpText are not provided", () => {
    const html = renderToStaticMarkup(
      <ProInput
        id="width-input"
        label="Width"
        value="20"
        onChange={() => {}}
      />
    );

    expect(html).toContain('id="width-input-label"');
    expect(html).toContain('aria-labelledby="width-input-label"');
    expect(html).not.toContain('aria-describedby');
  });
});
