import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TwoFactorInput } from "@/components/auth/TwoFactorInput";

describe("TwoFactorInput accessibility", () => {
  it("renders with proper dialog role, ARIA attributes, and accessible close button", () => {
    const html = renderToStaticMarkup(
      <TwoFactorInput
        email="test@example.com"
        onSubmit={async () => {}}
        onCancel={() => {}}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="two-factor-title"');
    expect(html).toContain('id="two-factor-title"');
    expect(html).toContain('aria-label="Close verification dialog"');
    expect(html).toContain("focus-visible:ring-2");
  });
});
