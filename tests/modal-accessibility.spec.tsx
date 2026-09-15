import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal component accessibility", () => {
  it("renders modal dialog container with role='dialog' and aria-modal='true'", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Modal dialog"');
    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain("focus-visible:ring-emerald-500");
    expect(html).toContain("Modal content");
  });

  it("returns null when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Hidden content</p>
      </Modal>,
    );

    expect(html).toBe("");
  });
});
