import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal accessibility", () => {
  it("renders with proper ARIA attributes when open", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} ariaLabel="New Estimate Modal">
        <div>Modal Content</div>
      </Modal>,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="New Estimate Modal"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain("Modal Content");
  });

  it("returns null when closed", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>,
    );

    expect(html).toBe("");
  });
});
