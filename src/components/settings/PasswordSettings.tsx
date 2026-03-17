"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, LockKeyhole, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
  getPasswordPolicyError,
} from "@/lib/security/password-policy";

async function parseJsonSafe(
  response: Response,
): Promise<Record<string, unknown>> {
  const raw = await response.text();
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { error: raw };
  }
}

export function PasswordSettings() {
  const { data: session } = useSession();
  const [authProviders, setAuthProviders] = useState<string[]>([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;

    (async () => {
      try {
        const response = await fetch("/api/auth/linked-providers", {
          cache: "no-store",
        });
        const payload = await parseJsonSafe(response);
        if (!response.ok) return;
        const providers = Array.isArray(payload.providers)
          ? payload.providers.filter(
              (provider): provider is string => typeof provider === "string",
            )
          : [];
        setAuthProviders(providers);
      } catch {
        setAuthProviders([]);
      }
    })();
  }, [session?.user?.id]);

  const hasCredentialsProvider = authProviders.includes("credentials");
  const hasGoogleProvider = authProviders.includes("google");

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation must match.");
      return;
    }

    const passwordPolicyError = getPasswordPolicyError(passwordForm.newPassword);
    if (passwordPolicyError) {
      setPasswordError(passwordPolicyError);
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const json = await parseJsonSafe(res);
      const apiError = typeof json.error === "string" ? json.error : null;
      if (!res.ok) {
        throw new Error(apiError ?? `Password update failed (${res.status})`);
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess("Password updated successfully.");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Password update failed",
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  if (!session) return null;

  return (
    <section className="content-card mx-auto mt-8 max-w-2xl p-6">
      <div className="mb-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[--color-ink-dim]">
          <LockKeyhole className="h-4 w-4" aria-hidden />
          Change Password
        </h2>
        <p className="text-sm text-[--color-ink-dim]">
          Use this if you sign in with email and password. Google-only accounts
          will need to manage password access through their provider.
        </p>
      </div>

      {!hasCredentialsProvider && hasGoogleProvider && (
        <div className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-4 py-3 text-sm text-[--color-ink-mid]">
          This account is connected with Google sign-in only. Password changes
          are managed by Google.
        </div>
      )}

      {hasCredentialsProvider && (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[--color-ink-mid]">
              Current Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((current) => ({
                  ...current,
                  currentPassword: e.target.value,
                }))
              }
              required
              className="w-full rounded-xl border border-slate-500 bg-[--color-surface-alt] px-4 py-2.5 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[--color-ink-mid]">
              New Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((current) => ({
                  ...current,
                  newPassword: e.target.value,
                }))
              }
              required
              className="w-full rounded-xl border border-slate-500 bg-[--color-surface-alt] px-4 py-2.5 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[--color-ink-mid]">
              Confirm New Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((current) => ({
                  ...current,
                  confirmPassword: e.target.value,
                }))
              }
              required
              className="w-full rounded-xl border border-slate-500 bg-[--color-surface-alt] px-4 py-2.5 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[--color-ink-dim]">
              Password Requirements
            </p>
            <ul className="space-y-1 text-xs text-[--color-ink-dim]">
              {PASSWORD_REQUIREMENTS.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>

          {passwordError && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-2 text-sm text-red-600">
              {passwordError}
            </p>
          )}

      {passwordSuccess && (
        <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-4 py-2 text-sm text-emerald-700">
          {passwordSuccess}
        </p>
      )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[--color-nav-bg] py-3 font-bold text-white transition-all hover:opacity-95 disabled:opacity-70"
          >
            {passwordSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LockKeyhole className="h-4 w-4" />
            )}
            {passwordSaving ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      )}

      <div className="mt-10 border-t border-[--color-border]/60 pt-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-600">
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete Account
        </h3>
        <p className="text-sm text-[--color-ink-dim] mb-3">
          Permanently remove your account and linked sign-in methods. This cannot be undone.
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
              await signOut({ callbackUrl: "/" });
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
