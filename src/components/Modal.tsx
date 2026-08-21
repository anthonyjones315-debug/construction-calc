import React, { ReactNode, useEffect } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  ariaLabel = "Modal dialog",
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="relative z-10 flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-400 backdrop-blur-sm transition hover:bg-white hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-blue-brand] shadow-sm"
          aria-label="Close modal"
        >
          ✕
        </button>
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
};
