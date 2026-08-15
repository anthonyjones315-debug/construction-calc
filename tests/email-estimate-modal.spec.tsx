import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmailEstimateModal } from "@/components/ui/EmailEstimateModal";

describe("EmailEstimateModal Accessibility & UX", () => {
  const dummyEstimate = {
    title: "Deck Construction",
    calculatorLabel: "Decking Calculator",
    results: [
      {
        label: "Total Area",
        value: "250",
        unit: "sq ft",
      },
    ],
  };

  it("renders with correct ARIA dialog attributes and title association when open", () => {
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
    expect(html).toContain("Email Estimate");
    expect(html).toContain('aria-label="Close"');
  });

  it("renders nothing when closed", () => {
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
