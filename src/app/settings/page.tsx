"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { BusinessProfile } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  LockKeyhole,
  Upload,
  Save,
  Loader2,
  LogIn,
} from "lucide-react";
import Link from "next/link";

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

function SettingsContent() {
  const { data: session, status } = useSession();
  const accountEmail = session?.user?.email ?? "";
  const [isOwner, setIsOwner] = useState(false);
  const [membershipRole, setMembershipRole] = useState<string>("member");
  const [authProviders, setAuthProviders] = useState<string[]>([]);
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const localPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await fetch("/api/business-profile");
        const payload = await parseJsonSafe(response);
        const ownerAccess = Boolean(payload?.isOwner);
        const role =
          typeof payload?.role === "string" ? payload.role : "member";
        setIsOwner(ownerAccess);
        setMembershipRole(role);
        const p =
          payload && typeof payload === "object" && "profile" in payload
            ? (payload.profile as Record<string, unknown> | null)
            : null;

        if (p) {
          setProfile({
            ...p,
            business_email: accountEmail || String(p.business_email ?? ""),
          });
        } else {
          setProfile({ business_email: accountEmail });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [accountEmail, session, status]);

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

  useEffect(() => {
    if (!accountEmail) return;

    setProfile((current) => ({
      ...current,
      business_email: accountEmail,
    }));
  }, [accountEmail]);

  useEffect(
    () => () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    },
    [],
  );

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (localPreviewUrlRef.current) {
      URL.revokeObjectURL(localPreviewUrlRef.current);
      localPreviewUrlRef.current = null;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    localPreviewUrlRef.current = localPreviewUrl;
    setLogoPreviewUrl(localPreviewUrl);

    if (!isOwner) {
      setError("Only business owners can edit business-wide settings.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    if (!session?.user?.id) {
      setError("You must be signed in to upload a logo.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("logo", file);
      const res = await fetch("/api/business-profile/logo", {
        method: "POST",
        body: form,
      });
      const json = await parseJsonSafe(res);
      const apiError = typeof json.error === "string" ? json.error : null;
      const uploadedUrl = typeof json.url === "string" ? json.url : null;
      if (!res.ok) throw new Error(apiError ?? `Upload failed (${res.status})`);
      if (!uploadedUrl)
        throw new Error("Upload succeeded but no logo URL was returned.");

      const cacheBustedLogoUrl = `${uploadedUrl}${uploadedUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
      setProfile((p) => ({ ...p, logo_url: uploadedUrl }));
      setLogoPreviewUrl(cacheBustedLogoUrl);

      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
        localPreviewUrlRef.current = null;
      }

      setLogoSaved(true);
      setTimeout(() => setLogoSaved(false), 3000);
    } catch (err) {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
        localPreviewUrlRef.current = null;
      }
      setLogoPreviewUrl(null);
      setError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const displayedLogoUrl = logoPreviewUrl ?? profile.logo_url ?? null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isOwner) return;
    if (!session?.user?.id) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/business-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await parseJsonSafe(res);
      const apiError = typeof json.error === "string" ? json.error : null;
      if (!res.ok) throw new Error(apiError ?? `Save failed (${res.status})`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation must match.");
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
      if (!res.ok)
        throw new Error(apiError ?? `Password update failed (${res.status})`);

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

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[--color-orange-brand] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <LogIn className="w-10 h-10 text-[--color-orange-brand] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[--color-ink] mb-2">
          Sign in to manage your business profile
        </h1>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 bg-[--color-orange-brand] text-white font-bold px-6 py-3 rounded-xl"
        >
          Sign In Free
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-display font-bold text-[--color-ink] mb-1">
        Business Profile
      </h1>
      <p className="text-sm text-[--color-ink-dim] mb-8">
        This info appears on your exported PDF estimates.
      </p>

      {!isOwner && (
        <div className="mb-6 rounded-xl border border-[--color-orange-brand]/50 bg-[--color-nav-bg] px-4 py-3 text-sm font-semibold text-white">
          Read-Only: Team Member Access
          <span className="ml-2 text-white/70 font-normal">
            ({membershipRole})
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo */}
        <div className="content-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-ink-dim] mb-4">
            Company Logo
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[--color-border] bg-[--color-surface-alt]">
              {displayedLogoUrl ? (
                <img
                  src={displayedLogoUrl}
                  alt="Business logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Building2 className="w-8 h-8 text-[--color-ink-dim]" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || !isOwner}
                className="flex items-center gap-2 rounded-lg border border-[--color-border] px-4 py-2 text-sm font-medium text-[--color-ink-mid] transition-all hover:border-[--color-orange-brand] hover:text-[--color-orange-brand]"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "Uploading…" : "Upload Logo"}
              </button>
              {logoSaved ? (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Logo saved!
                </p>
              ) : (
                <p className="text-xs text-[--color-ink-dim] mt-1">
                  PNG, JPG or SVG — max 2MB
                </p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!isOwner}
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        </div>

        {/* Business info */}
        <div className="content-card space-y-4 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-ink-dim] mb-2">
            Contact Info
          </h2>

          {[
            {
              field: "business_name",
              label: "Business Name",
              icon: Building2,
              placeholder: "Acme Construction LLC",
            },
            {
              field: "business_tax_id",
              label: "Tax ID",
              icon: Building2,
              placeholder: "12-3456789",
            },
            {
              field: "business_phone",
              label: "Phone",
              icon: Phone,
              placeholder: "(315) 555-0100",
            },
            {
              field: "business_email",
              label: "Email",
              icon: Mail,
              placeholder: accountEmail,
              type: "email",
              readOnly: true,
            },
            {
              field: "business_address",
              label: "Address",
              icon: MapPin,
              placeholder: "123 Main St, Rome, NY 13440",
            },
            {
              field: "business_website",
              label: "Website",
              icon: Globe,
              placeholder: "https://yourbusiness.com",
              type: "url",
            },
          ].map(({ field, label, icon: Icon, placeholder, type, readOnly }) => (
            <div key={field}>
              <label className="text-sm font-medium text-[--color-ink-mid] flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" aria-hidden /> {label}
              </label>
              <input
                type={type ?? "text"}
                value={(profile as Record<string, string>)[field] ?? ""}
                onChange={
                  readOnly || !isOwner
                    ? undefined
                    : (e) =>
                        setProfile((p) => ({ ...p, [field]: e.target.value }))
                }
                placeholder={placeholder}
                disabled={readOnly || !isOwner}
                readOnly={readOnly || !isOwner}
                aria-readonly={readOnly || !isOwner}
                className={`w-full rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-2.5 text-sm text-[--color-ink] ${readOnly || !isOwner ? "cursor-not-allowed opacity-80" : "focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"}`}
              />
              {(readOnly || !isOwner) && (
                <p className="mt-1 text-xs text-[--color-ink-dim]">
                  {readOnly
                    ? "Locked to your sign-in email address."
                    : "Business settings are owner-managed."}
                </p>
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {isOwner && (
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold py-3 rounded-xl transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Profile"}
          </button>
        )}
      </form>

      <section className="content-card mt-8 p-6">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-ink-dim] mb-2 flex items-center gap-2">
            <LockKeyhole className="w-4 h-4" aria-hidden />
            Change Password
          </h2>
          <p className="text-sm text-[--color-ink-dim]">
            Use this if you sign in with email and password. Google-only
            accounts will need to manage password access through their provider.
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
              <label className="text-sm font-medium text-[--color-ink-mid] mb-1 block">
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
                className="w-full rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-2.5 text-sm text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[--color-ink-mid] mb-1 block">
                New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: e.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-2.5 text-sm text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[--color-ink-mid] mb-1 block">
                Confirm New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-2.5 text-sm text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
              />
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
              className="w-full flex items-center justify-center gap-2 bg-[--color-nav-bg] hover:opacity-95 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {passwordSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LockKeyhole className="w-4 h-4" />
              )}
              {passwordSaving ? "Updating Password…" : "Update Password"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[--color-bg]">
      <Header />
      <main id="main-content" className="flex-1">
        <SettingsContent />
      </main>
      <Footer />
    </div>
  );
}
