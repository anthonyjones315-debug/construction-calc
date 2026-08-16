import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal Accessibility", () => {
  it("renders role='dialog' and aria-modal='true' when open", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} aria-label="Test Modal">
        <div>Modal Content</div>
      </Modal>,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Test Modal"');
    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain("Modal Content");
  });

  it("renders null when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>,
    );

    expect(html).toBe("");
  });
});
