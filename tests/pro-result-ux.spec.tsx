import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProResult } from "@/components/ui/glass-elements";

describe("ProResult micro-UX enhancements", () => {
  const defaultProps = {
    primary: { label: "Concrete Needed", value: "4.5", unit: "cubic yards" },
    secondary: [
      { label: "Bags (80lb)", value: "203", unit: "bags" },
      { label: "Estimated Cost", value: "$315.00", unit: "USD" },
    ],
    primaryUnitDisplay: "cu yd",
    localTip: "Order 5% to 10% extra for waste and spillage.",
    materialList: ["203x 80lb Premix Concrete Bags", "3x Rebar Sheets 4x8"],
  };

  it("renders result labels, values, and material list items with accessible markup", () => {
    const html = renderToStaticMarkup(
      <ProResult {...defaultProps} onCopyOrder={() => {}} onFinalize={() => {}} />
    );

    expect(html).toContain("Concrete Needed");
    expect(html).toContain("cu yd");
    expect(html).toContain("Bags (80lb)");
    expect(html).toContain("Pro Tip");
    expect(html).toContain("203x 80lb Premix Concrete Bags");

    // Copy button accessibility & focus-visible styles
    expect(html).toContain("aria-label=\"Copy material list\"");
    expect(html).toContain("focus-visible:ring-primary");
    expect(html).toContain("focus-visible:ring-2");

    // Screen reader live region
    expect(html).toContain("role=\"status\"");
    expect(html).toContain("aria-live=\"polite\"");

    // Finalize button focus-visible styles
    expect(html).toContain("Finalize Estimate");
  });
});
