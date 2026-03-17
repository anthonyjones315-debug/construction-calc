"use client";

import { useEffect, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { getUserFacingErrorDetails } from "@/lib/errors/user-facing";

type ContactFormProps = {
  initialName?: string;
  initialEmail?: string;
  initialSubject?: string;
  initialMessage?: string;
  submitLabel?: string;
  successMessage?: string;
  mode?: "general" | "error-report";
  reportContext?: {
    reportType?: "general" | "error";
    source?: string;
    pageUrl?: string;
    eventId?: string;
    digest?: string;
    technicalMessage?: string;
    userFacingMessage?: string;
    userAgent?: string;
    browserTime?: string;
  };
};

export function ContactForm({
  initialName = "",
  initialEmail = "",
  initialSubject = "",
  initialMessage = "",
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

  const inputClass =
    "h-10 w-full rounded-xl border border-slate-500 bg-slate-900 px-3 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500";
  const labelClass = "flex flex-col gap-1 text-sm text-slate-300";

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className={labelClass}>
        Email <span className="text-red-400">*</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={120}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Subject
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Feedback / question"
          maxLength={200}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Message <span className="text-red-400">*</span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message..."
          rows={4}
          maxLength={10000}
          className={`min-h-[100px] resize-y rounded-xl border border-slate-500 bg-slate-900 px-3 py-2 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500`}
        />
      </label>
      {status === "error" && errorMessage && (
        <p className="text-sm text-red-300">{errorMessage}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-4 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
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
