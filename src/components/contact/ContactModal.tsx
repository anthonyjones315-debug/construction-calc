"use client";

import { X } from "lucide-react";
import { ContactForm } from "./ContactForm";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  formProps?: React.ComponentProps<typeof ContactForm>;
}

export function ContactModal({
  open,
  onClose,
  title = "Contact us",
  description = "Send feedback or a question. We'll get back to you via email.",
  formProps,
}: ContactModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/6 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <h2
            id="contact-modal-title"
            className="font-display text-lg font-bold text-white"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>

          <div className="mt-4">
            <ContactForm {...formProps} />
          </div>
        </div>
      </div>
    </>
  );
}
