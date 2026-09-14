import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactModal } from "@/components/contact/ContactModal";

describe("ContactModal accessibility attributes", () => {
  it("renders close button with descriptive aria-label", () => {
    const html = renderToStaticMarkup(
      <ContactModal open onClose={() => {}} title="Contact Us" />,
    );

    expect(html).toContain('aria-label="Close contact modal"');
  });
});
