import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TwoFactorInput } from "@/components/auth/TwoFactorInput";

describe("TwoFactorInput accessibility and UX", () => {
  it("renders accessible dialog attributes, heading ID connection, focus-visible styling, and decorative icon hiding", () => {
    const html = renderToStaticMarkup(
      <TwoFactorInput
        email="contractor@example.com"
        onSubmit={async () => {}}
        onCancel={() => {}}
      />,
    );

    // Modal dialog ARIA attributes
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="two-factor-title"');

    // Title element ID
    expect(html).toContain('id="two-factor-title"');
    expect(html).toContain("Enter verification code");
    expect(html).toContain("contractor@example.com");

    // Close button accessibility & focus-visible styling
    expect(html).toContain('aria-label="Close verification dialog"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");

    // Decorative icon aria-hidden
    expect(html).toContain('aria-hidden="true"');
  });
});
