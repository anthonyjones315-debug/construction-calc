"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { Loader2, LockKeyhole, Trash2 } from "lucide-react";
import { useState } from "react";

export function PasswordSettings() {
  const { userId, isLoaded } = useAuth();
  const session = !!userId;
  const status = isLoaded ? (userId ? "authenticated" : "unauthenticated") : "loading";
  const { signOut } = useClerk();
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const hasGoogleProvider =
    user?.externalAccounts?.some((a) =>
      String(a.provider).toLowerCase().includes("google"),
    ) ?? false;
  const hasPasswordProvider = user?.passwordEnabled === true;

  if (!session) return null;

  return (
    <section className="content-card mx-auto mt-8 max-w-2xl p-6">
      <div className="mb-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[--color-ink-dim]">
          <LockKeyhole className="h-4 w-4" aria-hidden />
          Account security
        </h2>
        <p className="text-sm text-[--color-ink-dim]">
          Passwords, two-factor authentication, and connected accounts are
          managed through your Clerk account.
        </p>
      </div>

      {hasGoogleProvider && !hasPasswordProvider && (
        <div className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-4 py-3 text-sm text-[--color-ink-mid]">
          This account is connected with Google sign-in only. Password changes
          are managed by Google.
        </div>
      )}

      <div className="mt-6 space-y-4">
        <h3 className="text-sm font-semibold text-[--color-ink]">
          Password &amp; MFA
        </h3>
        <p className="text-sm text-[--color-ink-dim]">
          Update your password, enable MFA, and review connected accounts in
          Clerk&apos;s secure account panel.
        </p>
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[--color-blue-brand] px-4 text-sm font-bold text-white transition hover:bg-[--color-blue-dark]"
        >
          Open account security
        </button>
      </div>

      <div className="mt-10 border-t border-[--color-border]/60 pt-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-600">
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete Account
        </h3>
        <p className="text-sm text-[--color-ink-dim] mb-3">
          Permanently remove your account and linked sign-in methods. This cannot
          be undone.
        </p>
        {deleteError && (
          <p className="mb-3 rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-2 text-sm text-red-600">
            {deleteError}
          </p>
        )}
        {deleteSuccess && (
          <p className="mb-3 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-4 py-2 text-sm text-emerald-700">
            {deleteSuccess}
          </p>
        )}
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            setDeleteError("");
            setDeleteSuccess("");
            const confirmed = window.confirm(
              "Delete your account permanently? This cannot be undone.",
            );
            if (!confirmed) return;

            setDeleting(true);
            try {
              const res = await fetch("/api/auth/delete-account", {
                method: "POST",
              });
              if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(
                  typeof payload.error === "string"
                    ? payload.error
                    : "Failed to delete account",
                );
              }
              setDeleteSuccess("Account deleted. Signing you out…");
              await signOut({ redirectUrl: "/" });
            } catch (error) {
              setDeleteError(
                error instanceof Error ? error.message : "Failed to delete account",
              );
            } finally {
              setDeleting(false);
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-600/90 py-3 font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {deleting ? "Deleting…" : "Delete Account"}
        </button>
      </div>
    </section>
  );
}
