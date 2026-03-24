"use client";

import type { BusinessProfile } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Building2,
  Phone,
  Mail,
  Upload,
  Save,
  Loader2,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { routes } from "@routes";

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

export function ProfileSettings() {
  const { userId, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const session = userId
    ? {
        user: {
          id: userId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? null,
          name:
            [clerkUser?.firstName, clerkUser?.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() || null,
        },
      }
    : null;
  const status = isLoaded ? (userId ? "authenticated" : "unauthenticated") : "loading";
  const accountEmail = session?.user?.email ?? "";
  const [isOwner, setIsOwner] = useState(false);
  const [membershipRole, setMembershipRole] = useState<string>("member");
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
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
            business_email:
              String(p.business_email ?? "").trim() || accountEmail || "",
          });
        } else {
          setProfile({ business_email: accountEmail });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [accountEmail, session, status]);

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
      if (!uploadedUrl) {
        throw new Error("Upload succeeded but no logo URL was returned.");
      }

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isOwner || !session?.user?.id) return;

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

  const displayedLogoUrl = logoPreviewUrl ?? profile.logo_url ?? null;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[--color-blue-brand] border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <LogIn className="mx-auto mb-4 h-10 w-10 text-[--color-blue-brand]" />
        <h1 className="mb-2 text-xl font-bold text-[--color-ink]">
          Sign in to manage your business profile
        </h1>
        <Link
          href={routes.auth.signIn}
          className="inline-flex items-center gap-2 rounded-xl bg-[--color-blue-brand] px-6 py-3 font-bold text-white"
        >
          Sign In Free
        </Link>
      </div>
    );
  }

  return (
    <div
      id="business-profile"
      className="mx-auto max-w-2xl scroll-mt-24 px-4 py-10 sm:px-6"
    >
      <h1 className="mb-1 text-2xl font-display font-bold text-[--color-ink]">
        Business Profile
      </h1>
      <p className="mb-8 text-sm text-[--color-ink-dim]">
        Upload your logo and set the phone and company email used in customer communications.
      </p>

      {!isOwner && (
        <div className="mb-6 rounded-xl border border-[--color-blue-brand]/40 bg-[--color-blue-soft] px-4 py-3 text-sm font-semibold text-[--color-ink]">
          Read-Only: Team Member Access
          <span className="ml-2 font-normal text-[--color-ink-mid]">
            ({membershipRole})
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="content-card p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[--color-ink-dim]">
            Company Logo
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[--color-border] bg-[--color-surface-alt]">
              {displayedLogoUrl ? (
                <img
                  src={displayedLogoUrl}
                  alt="Business logo"
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <Building2 className="h-8 w-8 text-[--color-ink-dim]" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || !isOwner}
                className="flex items-center gap-2 rounded-lg border border-[--color-border] px-4 py-2 text-sm font-medium text-[--color-ink-mid] transition-all hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload Logo"}
              </button>
              {logoSaved ? (
                <p className="mt-1 text-xs font-medium text-green-600">
                  Logo saved.
                </p>
              ) : (
                <p className="mt-1 text-xs text-[--color-ink-dim]">
                  PNG, JPG or SVG, max 2MB
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

        <div className="content-card space-y-4 p-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-[--color-ink-dim]">
            Contractor Contact
          </h2>

          {[
            {
              field: "business_name",
              label: "Company Name",
              icon: Building2,
              placeholder: "Acme Construction LLC",
              type: "text",
            },
            {
              field: "business_phone",
              label: "Phone Number",
              icon: Phone,
              placeholder: "(315) 555-0100",
              type: "tel",
            },
            {
              field: "business_email",
              label: "Company Email",
              icon: Mail,
              placeholder: accountEmail || "estimating@yourbusiness.com",
              type: "email",
            },
          ].map(({ field, label, icon: Icon, placeholder, type }) => (
            <div key={field}>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-[--color-ink-mid]">
                <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
              </label>
              <input
                type={type}
                value={(profile as Record<string, string>)[field] ?? ""}
                onChange={
                  !isOwner
                    ? undefined
                    : (e) =>
                        setProfile((p) => ({ ...p, [field]: e.target.value }))
                }
                placeholder={placeholder}
                disabled={!isOwner}
                readOnly={!isOwner}
                className={`w-full rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-2.5 text-sm text-[--color-ink] ${
                  !isOwner
                    ? "cursor-not-allowed opacity-80"
                    : "focus:border-[--color-blue-brand] focus:outline-none focus:ring-2 focus:ring-[--color-blue-brand]/25"
                }`}
              />
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[--color-blue-brand] py-3 font-bold text-white transition-all hover:bg-[--color-blue-dark]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved" : "Save Profile"}
          </button>
        )}
      </form>
    </div>
  );
}
