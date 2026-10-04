import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmailEstimateModal } from "@/components/ui/EmailEstimateModal";

describe("EmailEstimateModal accessibility and micro-UX", () => {
  const dummyEstimate = {
    title: "Drywall Calculation",
    calculatorLabel: "Drywall & Sheetrock Calculator",
    results: [
      { label: "Total Sheets", value: 42, unit: "sheets" },
    ],
  };

  it("renders with accessible dialog markup, descriptive close label, and focus-visible classes", () => {
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
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
  });
});
