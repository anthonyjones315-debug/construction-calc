import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalculatorsDirectoryClient } from "@/app/calculators/CalculatorsDirectoryClient";

describe("CalculatorsDirectoryClient UX & Accessibility", () => {
  it("renders search input with accessibility attributes and search landmark", () => {
    const html = renderToStaticMarkup(<CalculatorsDirectoryClient />);

    expect(html).toContain('type="search"');
    expect(html).toContain(
      'aria-label="Search construction calculators by trade, task, or name"',
    );
    expect(html).toContain("Commercial-Grade Space Math");
  });
});
