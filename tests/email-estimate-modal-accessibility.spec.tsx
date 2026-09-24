import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmailEstimateModal } from "@/components/ui/EmailEstimateModal";

describe("EmailEstimateModal accessibility", () => {
  const dummyEstimate = {
    title: "Flooring Estimate",
    calculatorLabel: "Flooring Calculator",
    results: [{ label: "Total Area", value: 500, unit: "sq ft" }],
  };

  it("renders dialog ARIA attributes when open", () => {
    const html = renderToStaticMarkup(
      <EmailEstimateModal
        open={true}
        onClose={() => {}}
        estimate={dummyEstimate}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="email-estimate-title"');
    expect(html).toContain('id="email-estimate-title"');
  });

  it("includes descriptive aria-label and focus-visible styling on close button", () => {
    const html = renderToStaticMarkup(
      <EmailEstimateModal
        open={true}
        onClose={() => {}}
        estimate={dummyEstimate}
      />,
    );

    expect(html).toContain('aria-label="Close email estimate modal"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
  });

  it("does not render when open is false", () => {
    const html = renderToStaticMarkup(
      <EmailEstimateModal
        open={false}
        onClose={() => {}}
        estimate={dummyEstimate}
      />,
    );

    expect(html).toBe("");
  });
});
