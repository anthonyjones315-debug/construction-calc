import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalculatorsDirectoryClient } from "@/app/calculators/CalculatorsDirectoryClient";

describe("CalculatorsDirectoryClient accessibility and UX", () => {
  it("renders accessible search input with semantic ARIA label and landmarks", () => {
    const html = renderToStaticMarkup(<CalculatorsDirectoryClient />);

    expect(html).toContain('id="main-content"');
    expect(html).toContain('type="search"');
    expect(html).toContain(
      'aria-label="Search construction calculators by trade, task, or name"',
    );
  });
});
