import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactModal } from "@/components/contact/ContactModal";

describe("ContactModal accessibility", () => {
  it("renders with a descriptive close button aria-label and dialog attributes", () => {
    const html = renderToStaticMarkup(
      <ContactModal open onClose={() => {}} title="Contact Us" />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="contact-modal-title"');
    expect(html).toContain('aria-label="Close contact modal"');
    expect(html).toContain("focus-visible:ring-2");
  });
});
