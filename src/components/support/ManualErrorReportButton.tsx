"use client";

import { useMemo, useState } from "react";
import { ContactModal } from "@/components/contact/ContactModal";
import {
  getTechnicalErrorMessage,
  getUserFacingErrorDetails,
} from "@/lib/errors/user-facing";

type Props = {
  error: Error & { digest?: string };
  eventId?: string | null;
  source: string;
  buttonLabel?: string;
  title?: string;
  description?: string;
  className?: string;
};

export function ManualErrorReportButton({
  error,
  eventId,
  source,
  buttonLabel = "Send backup report",
  title = "Send a backup error report",
  description = "If the Sentry dialog does not load, use this form so we still get the details we need.",
  className,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const userFacing = getUserFacingErrorDetails(error);
  const technicalMessage = getTechnicalErrorMessage(error);
  const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-[--color-orange-brand]/40 px-4 py-2.5 text-sm font-semibold text-[--color-orange-brand] transition-colors hover:bg-[--color-orange-brand]/10";

  const formProps = useMemo(() => {
    const pageUrl =
      typeof window !== "undefined" ? window.location.href : undefined;
    const browserTime =
      typeof window !== "undefined" ? new Date().toISOString() : undefined;

    return {
      initialSubject: `Manual error report: ${userFacing.title}`,
      messagePlaceholder: [
        "Tell us what you were trying to do.",
        "What happened instead?",
        "Anything you expected to see?",
      ].join("\n"),
      submitLabel: "Send error report",
      successMessage:
        "Thanks. Your report is in, and we’ll use it to trace the failure even if automated capture missed it.",
      mode: "error-report" as const,
      reportContext: {
        reportType: "error" as const,
        source,
        pageUrl,
        eventId: eventId ?? undefined,
        digest: error.digest ?? undefined,
        technicalMessage: technicalMessage || undefined,
        userFacingTitle: userFacing.title,
        userFacingMessage: userFacing.message,
        browserTime,
        userAgent:
          typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      },
    };
  }, [error.digest, eventId, source, technicalMessage, userFacing.message, userFacing.title]);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`${buttonClassName} ${className ?? ""}`.trim()}
      >
        {buttonLabel}
      </button>
      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={title}
        description={description}
        formProps={formProps}
      />
    </>
  );
}
