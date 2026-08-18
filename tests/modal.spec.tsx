import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Modal } from "../src/components/Modal";

describe("Modal component", () => {
  it("renders with role='dialog' and aria-modal='true' when open", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Test Modal"');
    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain('Modal content');
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
