import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FAQAccordion } from "../src/app/faq/FaqAccordion";

describe("FAQAccordion component accessibility & UX", () => {
  it("renders buttons with proper focus-visible ring classes, aria-expanded, aria-controls, and aria-hidden attributes", () => {
    const items = [
      { q: "What is this calculator?", a: "It calculates materials." },
    ];
    const html = renderToStaticMarkup(<FAQAccordion items={items} />);

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls=');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
  });
});
