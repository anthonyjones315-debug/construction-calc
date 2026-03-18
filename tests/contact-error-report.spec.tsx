import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactModal } from "@/components/contact/ContactModal";

describe("backup error report UI", () => {
  it("keeps the operator notes editable while locking system diagnostics", () => {
    const html = renderToStaticMarkup(
      <ContactForm
        mode="error-report"
        initialSubject="Manual error report: We couldn't complete your sign-in"
        reportContext={{
          source: "auth-error-page",
          eventId: "evt_123",
          userFacingTitle: "We couldn't complete your sign-in",
          userFacingMessage:
            "Your provider returned to us, but the secure callback verification failed.",
          technicalMessage: "OAuth callback verification failed.",
          pageUrl: "https://example.com/auth/error?error=OAuthCallbackHandlerError",
          browserTime: "2026-03-18T07:55:00.000Z",
        }}
      />,
    );

    expect((html.match(/<textarea/g) ?? []).length).toBe(2);
    expect((html.match(/readOnly=""|readonly=""/g) ?? []).length).toBe(1);
    expect(html).toContain("Locked System Details");
    expect(html).toContain("Tell us what you were trying to do.");
    expect(html).toContain("Friendly summary: We couldn&#x27;t complete your sign-in");
    expect(html).toContain("Technical error: OAuth callback verification failed.");
  });

  it("renders the backup report in the shared liquid-glass modal shell", () => {
    const html = renderToStaticMarkup(
      <ContactModal
        open
        onClose={() => {}}
        title="Send a backup error report"
        description="Use this form if the embedded feedback tool does not load."
        formProps={{
          mode: "error-report",
          reportContext: {
            source: "auth-error-page",
            userFacingTitle: "Sign-in error",
            userFacingMessage: "The provider callback did not complete.",
          },
        }}
      />,
    );

    expect(html).toContain("glass-modal-overlay");
    expect(html).toContain("glass-modal relative");
    expect(html).toContain("Send a backup error report");
    expect(html).toContain("text-copy-primary");
  });
});
