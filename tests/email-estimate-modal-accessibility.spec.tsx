import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmailEstimateModal } from "@/components/ui/EmailEstimateModal";

const dummyEstimate = {
  title: "Concrete Slab Estimate",
  calculatorLabel: "Concrete Slab Calculator",
  results: [
    { label: "Volume", value: 10, unit: "cu yd" },
  ],
};

describe("EmailEstimateModal accessibility and UX", () => {
  it("renders with proper ARIA modal attributes and focus-visible styling", () => {
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
    expect(html).toContain('aria-label="Close email estimate modal"');
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
    expect(html).toContain('aria-hidden="true"');
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
