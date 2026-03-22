"use client";

import { useEffect, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { getUserFacingErrorDetails } from "@/lib/errors/user-facing";

type ContactReportContext = {
  reportType?: "general" | "error";
  source?: string;
  pageUrl?: string;
  eventId?: string;
  digest?: string;
  technicalMessage?: string;
  userFacingTitle?: string;
  userFacingMessage?: string;
  userAgent?: string;
  browserTime?: string;
};

type ContactFormProps = {
  initialName?: string;
  initialEmail?: string;
  initialSubject?: string;
  initialMessage?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  successMessage?: string;
  mode?: "general" | "error-report";
  reportContext?: ContactReportContext;
};

function buildLockedDiagnostics(reportContext?: ContactReportContext) {
  if (!reportContext) return "";

  const fields = [
    ["Friendly summary", reportContext.userFacingTitle],
    ["Operator-safe message", reportContext.userFacingMessage],
    ["Source", reportContext.source],
    ["Reference", reportContext.eventId ?? reportContext.digest],
    ["Page", reportContext.pageUrl],
    ["Browser time", reportContext.browserTime],
    ["User agent", reportContext.userAgent],
    ["Technical error", reportContext.technicalMessage],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()));

  return fields.map(([label, value]) => `${label}: ${value}`).join("\n\n");
}

export function ContactForm({
  initialName = "",
  initialEmail = "",
  initialSubject = "",
  initialMessage = "",
  messagePlaceholder,
  submitLabel = "Send",
  successMessage = "Thanks for reaching out. We'll get back to you soon.",
  mode = "general",
  reportContext,
}: ContactFormProps = {}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
    setSubject(initialSubject);
    setMessage(initialMessage);
  }, [initialEmail, initialMessage, initialName, initialSubject]);

  const isErrorReport = mode === "error-report";
  const lockedDiagnostics = buildLockedDiagnostics(reportContext);
  const resolvedMessagePlaceholder =
    messagePlaceholder ||
    (isErrorReport
      ? [
          "Tell us what you were trying to do.",
          "What happened instead?",
          "Anything you expected to see?",
        ].join("\n")
      : "Your message...");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !message.trim()) return;
    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: trimmedEmail,
          subject: subject.trim() || undefined,
          message: message.trim(),
          reportType:
            reportContext?.reportType ??
            (mode === "error-report" ? "error" : "general"),
          source: reportContext?.source,
          pageUrl: reportContext?.pageUrl,
          eventId: reportContext?.eventId,
          digest: reportContext?.digest,
          technicalMessage: reportContext?.technicalMessage,
          userFacingTitle: reportContext?.userFacingTitle,
          userFacingMessage: reportContext?.userFacingMessage,
          userAgent: reportContext?.userAgent,
          browserTime: reportContext?.browserTime,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to send message.");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        getUserFacingErrorDetails(err, {
          title: "Message did not send",
          message:
            "We couldn't deliver your message from the app right now. Try again, or email us directly if you need a faster reply.",
        }).message,
      );
    }
  }

  const labelClass =
    "flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary";
  const labelHintClass =
    "text-[11px] font-normal normal-case tracking-normal text-copy-tertiary";
  const fieldShellClass =
    "glass-input-shell glass-panel-deep relative flex min-h-11 overflow-hidden rounded-xl p-0";
  const inputClass =
    "glass-input h-11 w-full rounded-none border-0 bg-transparent px-3 text-sm text-field-input shadow-none";
  const textareaClass =
    "glass-input min-h-[148px] w-full rounded-none border-0 bg-transparent px-3 py-3 text-sm leading-relaxed text-field-input shadow-none";

  if (status === "sent") {
    return (
      <div className="glass-panel border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className={labelClass}>
        <span>
          Email <span className="text-red-400">*</span>
        </span>
        <div className={fieldShellClass}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </label>
      <label className={labelClass}>
        <span>Name</span>
        <div className={fieldShellClass}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={120}
            className={inputClass}
          />
        </div>
      </label>
      <label className={labelClass}>
        <span>Subject</span>
        <div className={fieldShellClass}>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Feedback / question"
            maxLength={200}
            className={inputClass}
          />
        </div>
      </label>
      <label className={labelClass}>
        <span>
          {isErrorReport ? "What happened" : "Message"}{" "}
          <span className="text-red-400">*</span>
        </span>
        {isErrorReport ? (
          <span className={labelHintClass}>
            Add your field notes here. We attach the locked system details
            separately below.
          </span>
        ) : null}
        <div className={fieldShellClass}>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={resolvedMessagePlaceholder}
            rows={6}
            maxLength={10000}
            className={`${textareaClass} resize-y`}
          />
        </div>
      </label>
      {isErrorReport && lockedDiagnostics ? (
        <div className="glass-panel-deep space-y-3 border-[--color-border] bg-[--color-surface-alt] p-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary">
              Locked System Details
            </p>
            <p className={labelHintClass}>
              This section is attached automatically and stays read-only so the
              technical error context arrives intact.
            </p>
          </div>
          <div className={fieldShellClass}>
            <textarea
              readOnly
              value={lockedDiagnostics}
              rows={8}
              className="glass-input min-h-[180px] w-full rounded-none border-0 bg-transparent px-3 py-3 font-mono text-[12px] leading-relaxed text-copy-secondary shadow-none"
            />
          </div>
        </div>
      ) : null}
      {status === "error" && errorMessage && (
        <div className="glass-panel border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="glass-button-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold disabled:opacity-60"
        >
          {status === "sending" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {status === "sending" ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
