import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal Accessibility", () => {
  it("renders modal with role='dialog', aria-modal='true', and default aria-label", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Modal window"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain("Modal Content");
  });

  it("supports custom ariaLabel", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} ariaLabel="New Estimate Modal">
        <div>Estimate Form</div>
      </Modal>
    );

    expect(html).toContain('aria-label="New Estimate Modal"');
  });

  it("returns null when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(html).toBe("");
  });
});
