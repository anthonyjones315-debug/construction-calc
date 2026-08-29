import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal Accessibility", () => {
  it("renders with role='dialog', aria-modal='true', and default or custom aria-label", () => {
    const defaultHtml = renderToStaticMarkup(
      <Modal isOpen onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>,
    );

    expect(defaultHtml).toContain('role="dialog"');
    expect(defaultHtml).toContain('aria-modal="true"');
    expect(defaultHtml).toContain('aria-label="Dialog"');
    expect(defaultHtml).toContain('aria-hidden="true"');
    expect(defaultHtml).toContain('aria-label="Close modal"');
    expect(defaultHtml).toContain("Modal Content");

    const customHtml = renderToStaticMarkup(
      <Modal isOpen onClose={() => {}} ariaLabel="New Client Form">
        <p>Client Details</p>
      </Modal>,
    );

    expect(customHtml).toContain('aria-label="New Client Form"');
  });

  it("does not render HTML markup when isOpen is false", () => {
    const closedHtml = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>,
    );

    expect(closedHtml).toBe("");
  });
});
