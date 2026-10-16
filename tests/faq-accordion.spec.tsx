import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FAQAccordion } from "@/app/faq/FaqAccordion";

describe("FAQAccordion Accessibility & Functionality", () => {
  const sampleItems = [
    { q: "Is Pro Construction Calc free?", a: "Yes, standard trade calculators are free to use." },
    { q: "Can I save estimates?", a: "Yes, you can create and save estimates." },
  ];

  it("renders buttons with proper focus-visible ring styles and aria attributes", () => {
    const html = renderToStaticMarkup(<FAQAccordion items={sampleItems} />);

    expect(html).toContain("Is Pro Construction Calc free?");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
    expect(html).toContain("focus-visible:ring-offset-2");
    expect(html).toContain('aria-expanded="false"');
  });

  it("includes button IDs and controls references for accordion items", () => {
    const html = renderToStaticMarkup(<FAQAccordion items={sampleItems} />);

    expect(html).toMatch(/aria-controls="[^"]+-panel-0"/);
    expect(html).toMatch(/id="[^"]+-button-0"/);
  });
});
