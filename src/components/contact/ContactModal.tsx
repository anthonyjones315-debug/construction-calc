"use client";

import { X } from "lucide-react";
import { GlassDialogFrame } from "@/components/ui/glass-elements";
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
    <div className="glass-modal-overlay px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative z-[60] w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassDialogFrame className="max-h-[min(88dvh,54rem)] overflow-hidden p-0">
          <button
            type="button"
            onClick={onClose}
            className="glass-panel-deep absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl p-0 text-copy-secondary transition-colors hover:text-copy-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <div className="glass-modal-header px-5 pt-5 pr-16">
            <h2
              id="contact-modal-title"
              className="font-display text-lg font-bold text-copy-primary"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-copy-secondary">{description}</p>
          </div>

          <div className="max-h-[calc(min(88dvh,54rem)-7rem)] overflow-y-auto px-5 pb-5">
            <ContactForm {...formProps} />
          </div>
        </GlassDialogFrame>
      </div>
    </div>
  );
}
