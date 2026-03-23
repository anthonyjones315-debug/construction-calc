import React, { ReactNode } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-400 backdrop-blur-sm transition hover:bg-white hover:text-slate-600 shadow-sm"
          aria-label="Close modal"
        >
          ✕
        </button>
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
