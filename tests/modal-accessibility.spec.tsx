import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal component accessibility", () => {
  it("renders with proper dialog roles and aria attributes", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} ariaLabel="Test modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Test modal"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('Modal Content');
  });

  it("does not render when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Hidden Content</div>
      </Modal>
    );

    expect(html).toBe("");
  });
});
