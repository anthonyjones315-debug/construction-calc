import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ManualErrorReportButton } from "@/components/support/ManualErrorReportButton";

describe("ManualErrorReportButton accessibility", () => {
  it("renders with dialog ARIA attributes and focus-visible ring styles", () => {
    const sampleError = Object.assign(new Error("Failed to load resource"), {
      digest: "digest_12345",
    });

    const html = renderToStaticMarkup(
      <ManualErrorReportButton
        error={sampleError}
        eventId="evt_999"
        source="test-source"
        buttonLabel="Send backup report"
        title="Send a backup error report"
      />,
    );

    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Send backup report");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
  });
});
