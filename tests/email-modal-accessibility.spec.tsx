import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EmailEstimateModal, EstimatePayload } from "@/components/ui/EmailEstimateModal";

describe("EmailEstimateModal Accessibility & Interactions", () => {
  const dummyEstimate: EstimatePayload = {
    title: "Test Estimate",
    calculatorLabel: "Concrete Calculator",
    results: [{ label: "Total Cost", value: "$500", unit: "USD" }],
  };

  it("renders with proper modal accessibility attributes", () => {
    const html = renderToStaticMarkup(
      <EmailEstimateModal open={true} onClose={() => {}} estimate={dummyEstimate} />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="email-estimate-title"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("does not render markup when open is false", () => {
    const html = renderToStaticMarkup(
      <EmailEstimateModal open={false} onClose={() => {}} estimate={dummyEstimate} />
    );

    expect(html).toBe("");
  });
});
