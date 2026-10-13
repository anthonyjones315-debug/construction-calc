import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal Accessibility", () => {
  it("renders role='dialog' and aria-modal='true' when open", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Dialog modal"');
    expect(html).toContain("Modal content");
  });

  it("renders custom aria-label when provided", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} ariaLabel="Create New Estimate">
        <p>Estimate content</p>
      </Modal>
    );

    expect(html).toContain('aria-label="Create New Estimate"');
  });

  it("renders aria-labelledby when ariaLabelledBy prop is provided", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} ariaLabelledBy="modal-heading">
        <h2 id="modal-heading">Modal Title</h2>
      </Modal>
    );

    expect(html).toContain('aria-labelledby="modal-heading"');
  });

  it("includes focus-visible outline and ring styling on the close button", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal body</p>
      </Modal>
    );

    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
  });

  it("returns null when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Hidden content</p>
      </Modal>
    );

    expect(html).toBe("");
  });
});
