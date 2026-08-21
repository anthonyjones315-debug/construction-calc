import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal Accessibility", () => {
  it("renders with correct ARIA attributes when open", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} ariaLabel="Edit Client Info">
        <div>Modal Content</div>
      </Modal>
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Edit Client Info"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain("Modal Content");
    expect(html).toContain("focus-visible:ring-2");
  });

  it("defaults aria-label to 'Modal dialog' if custom label is not provided", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );

    expect(html).toContain('aria-label="Modal dialog"');
  });

  it("renders nothing when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );

    expect(html).toBe("");
  });
});
