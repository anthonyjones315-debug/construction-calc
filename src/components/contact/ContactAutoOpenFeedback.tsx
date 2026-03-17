"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getFeedback } from "@sentry/browser";
import { ContactModal } from "./ContactModal";

async function openFeedbackDialog(): Promise<boolean> {
  const feedback = getFeedback();
  if (!feedback) return false;

  const dialog = await feedback.createForm({
    colorScheme: "dark",
    isNameRequired: true,
    isEmailRequired: true,
    enableScreenshot: true,
  });

  // Some builds require explicitly inserting the dialog into the shadow DOM.
  dialog.appendToDom();
  dialog.open();
  return true;
}

export function ContactAutoOpenFeedback() {
  const openedOnceRef = useRef(false);
  const [openFailed, setOpenFailed] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const memoFormProps = useMemo(() => {
    const pageUrl =
      typeof window !== "undefined" ? window.location.href : undefined;
    const userAgent =
      typeof window !== "undefined" ? window.navigator.userAgent : undefined;
    const browserTime =
      typeof window !== "undefined" ? new Date().toISOString() : undefined;

    return {
      initialSubject: "Manual feedback report",
      submitLabel: "Send backup report",
      successMessage:
        "Thanks. Your manual report is in, even though the Sentry form did not load in this browser.",
      mode: "error-report" as const,
      reportContext: {
        reportType: "error" as const,
        source: "contact-feedback-fallback",
        pageUrl,
        userAgent,
        browserTime,
      },
    };
  }, []);

  useEffect(() => {
    if (openedOnceRef.current) return;
    openedOnceRef.current = true;

    let cancelled = false;

    // Give Sentry a tick to finish initializing before reading the integration instance.
    const t = window.setTimeout(() => {
      openFeedbackDialog()
        .then((ok) => {
          if (!cancelled && !ok) setOpenFailed(true);
        })
        .catch(() => {
          if (!cancelled) setOpenFailed(true);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          setOpenFailed(false);
          openFeedbackDialog().then((ok) => {
            if (!ok) setOpenFailed(true);
          });
        }}
        className="btn-tactile inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-black uppercase text-white transition-all duration-200 hover:bg-orange-700 active:scale-[0.98]"
      >
        Open Feedback Form
      </button>
      {openFailed && (
        <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
          <p>
            The Sentry feedback form did not load in this browser. You can still
            send us a manual report here.
          </p>
          <button
            type="button"
            onClick={() => setManualModalOpen(true)}
            className="btn-tactile inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/40 px-4 py-2 text-sm font-bold uppercase text-white transition hover:bg-white/6"
          >
            Open Backup Form
          </button>
        </div>
      )}
      <p className="text-xs text-white/60">
        Your report includes optional screenshots (if you choose) and helps us
        fix issues faster.
      </p>
      <ContactModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Send a manual feedback report"
        description="If the embedded feedback tool does not load, use this backup form and we’ll still get the report."
        formProps={memoFormProps}
      />
    </div>
  );
}
