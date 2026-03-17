"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

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
  const router = useRouter();

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Enter verification code
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              We sent a code to {email}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={TWO_FACTOR_CODE_LENGTH}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full px-4 py-3 text-2xl tracking-[0.35em] text-center font-mono border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="000000"
              disabled={isSubmitting}
              required
            />
          </div>

          {submitError && (
            <p className="mt-2 text-sm text-red-600">{submitError}</p>
          )}

          <div className="mt-6 space-y-2">
            <button
              type="submit"
              disabled={code.length !== TWO_FACTOR_CODE_LENGTH || isSubmitting}
              className="w-full px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
