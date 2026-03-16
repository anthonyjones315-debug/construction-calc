"use client";

import { useEffect, useRef, useState } from "react";
import { getFeedback } from "@sentry/browser";

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
        <p className="text-sm text-red-300">
          The feedback form didn&apos;t load. Please email{" "}
          <a className="underline hover:text-white" href="mailto:amj111394@gmail.com">
            amj111394@gmail.com
          </a>
          .
        </p>
      )}
      <p className="text-xs text-white/60">
        Your report includes optional screenshots (if you choose) and helps us
        fix issues faster.
      </p>
    </div>
  );
}

