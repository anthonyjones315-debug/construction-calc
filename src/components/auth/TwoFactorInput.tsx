"use client";

import { useEffect, useRef, useState } from "react";
import { XCircle, ShieldCheck } from "lucide-react";
import { GlassButton, GlassIconBadge } from "@/components/ui/glass-elements";

const TWO_FACTOR_CODE_LENGTH = 6;

type TwoFactorInputProps = {
  email: string;
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
  error?: string;
};

export function TwoFactorInput({
  email,
  onSubmit,
  onCancel,
  error,
}: TwoFactorInputProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(error);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Prevent page scrolling while dialog is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== TWO_FACTOR_CODE_LENGTH) return;

    try {
      setIsSubmitting(true);
      setSubmitError(undefined);
      await onSubmit(code);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to verify code",
      );
      setCode("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-md glass-modal">
        <div className="glass-modal-header flex items-start justify-between">
          <div className="flex items-center gap-3">
            <GlassIconBadge className="rounded-full">
              <ShieldCheck className="w-6 h-6" />
            </GlassIconBadge>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Enter verification code
              </h2>
              <p className="text-sm text-[rgba(255,255,255,0.8)]">
                We sent a code to {email}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
            aria-label="Close"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mt-4">
            <label htmlFor="security-code" className="sr-only">
              Security code
            </label>
            <input
              id="security-code"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={TWO_FACTOR_CODE_LENGTH}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              className="glass-input w-full rounded-lg px-4 py-3 text-center font-mono text-2xl tracking-[0.35em] text-black"
              placeholder="000000"
              disabled={isSubmitting}
              aria-invalid={!!submitError}
              aria-describedby={submitError ? "error-message" : undefined}
              required
            />
          </div>

          {submitError && (
            <p
              id="error-message"
              className="mt-2 text-sm text-[rgba(239,68,68,1)]"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <div className="glass-modal-footer">
            <GlassButton
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2 md:w-auto"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={code.length !== TWO_FACTOR_CODE_LENGTH || isSubmitting}
              className="w-full px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
