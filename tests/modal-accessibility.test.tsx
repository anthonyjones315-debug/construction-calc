import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/Modal";

describe("Modal component accessibility", () => {
  it("renders role='dialog', aria-modal='true', custom aria-label, backdrop aria-hidden='true', and close button aria-label when isOpen=true", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={true} onClose={() => {}} ariaLabel="Edit Client Info">
        <div>Modal Body Content</div>
      </Modal>,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Edit Client Info"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain("Modal Body Content");
  });

  it("renders null when isOpen=false", () => {
    const html = renderToStaticMarkup(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Body Content</div>
      </Modal>,
    );

    expect(html).toBe("");
  });
});
