"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * POST /api/command-center/join — requires Clerk session + Supabase `users` row (same as owners).
 * Crew signs in first, then enters the code their admin shared from Command Center.
 */
export function JoinBusinessWithCodeForm() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim().replace(/\s+/g, "");
    if (!trimmed) {
      setError("Enter the join code.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/command-center/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: trimmed }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        setError(json.error ?? "Could not join with that code.");
        return;
      }

      window.location.assign("/command-center");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3 border-t border-[--color-border] pt-6">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-[--color-ink-dim]">
        Join an existing team
      </p>
      <p className="text-sm text-[--color-ink-mid]">
        Ask your admin for the crew join code from their Command Center, sign in with your
        account, then enter it here.
      </p>
      <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
        Join code
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. ABCD12"
          className="h-11 rounded-lg border border-[--color-border] bg-[--color-surface] px-3 font-mono text-[--color-ink] uppercase placeholder:text-[--color-ink-dim] placeholder:normal-case outline-none transition focus:border-[--color-orange-brand] focus:ring-2 focus:ring-[--color-orange-brand]/25"
        />
      </label>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[--color-border] bg-[--color-surface] px-5 text-sm font-black uppercase text-[--color-ink] shadow-sm transition hover:border-[--color-orange-brand] hover:text-[--color-orange-brand] disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Joining…
          </>
        ) : (
          "Join with code"
        )}
      </button>
    </form>
  );
}
