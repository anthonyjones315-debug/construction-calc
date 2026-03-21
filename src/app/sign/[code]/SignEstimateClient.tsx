"use client";

import Link from "next/link";
import SignatureCanvas from "react-signature-canvas";
import { CheckCircle2, Mail, PencilLine, Phone, RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";

function normalizeSignerEmail(value: string) {
  return value.trim().toLowerCase();
}

type PublicEstimate = {
  id: string;
  name: string;
  calculatorId: string;
  calculatorLabel: string;
  clientName: string | null;
  jobSiteAddress: string | null;
  status: "Draft" | "Sent" | "Approved" | "Lost" | "PENDING" | "SIGNED";
  results: Array<{ label: string; value: string | number; unit?: string }>;
  materialList: string[];
  shareCode: string;
  signUrl: string | null;
  generatedAt: string;
  jobName: string;
  createdAt: string;
  updatedAt: string;
  signing: {
    status?: "pending" | "signed";
    signedAt?: string;
    signerName?: string;
    signerEmail?: string;
    signatureDataUrl?: string;
    inviteRecipientEmail?: string;
  };
  contractor: {
    name: string | null;
    phone: string | null;
    email: string | null;
    logoUrl: string | null;
  };
};

type Props = {
  estimate: PublicEstimate;
};

function formatValue(value: string | number, unit?: string) {
  const rendered =
    typeof value === "number"
      ? (Math.round(value * 100) / 100).toFixed(2)
      : value;
  return unit ? `${rendered} ${unit}` : rendered;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.round(value * 100) / 100);
}

function toSmsHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return `sms:${normalized}`;
}

export function SignEstimateClient({ estimate }: Props) {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const lockedInviteEmail = useMemo(() => {
    const raw = estimate.signing.inviteRecipientEmail;
    if (typeof raw !== "string" || !raw.includes("@")) return null;
    return normalizeSignerEmail(raw);
  }, [estimate.signing.inviteRecipientEmail]);

  const [signerName, setSignerName] = useState(estimate.signing.signerName ?? "");
  const [signerEmail, setSignerEmail] = useState(
    lockedInviteEmail ??
      (estimate.signing.signerEmail
        ? normalizeSignerEmail(estimate.signing.signerEmail)
        : ""),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedAt, setSignedAt] = useState<string | null>(
    estimate.signing.signedAt ?? null,
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(
    estimate.signing.signatureDataUrl ?? null,
  );

  const isSigned =
    estimate.status === "SIGNED" ||
    estimate.status === "Approved" ||
    Boolean(signedAt);
  const primaryResult = estimate.results[0] ?? null;
  const summaryRows = useMemo(() => estimate.results.slice(0, 6), [estimate.results]);
  const contractorName = estimate.contractor.name || "Contractor";
  const canCall = Boolean(estimate.contractor.phone);
  const canMessage = Boolean(estimate.contractor.phone || estimate.contractor.email);

  function clearSignature() {
    signatureRef.current?.clear();
    setSignatureDataUrl(null);
    setError(null);
  }

  async function handleApprove() {
    setError(null);

    if (!signerName.trim()) {
      setError("Enter your name before signing.");
      return;
    }

    const pad = signatureRef.current;
    if (!pad || pad.isEmpty()) {
      setError("Add a signature before approving.");
      return;
    }

    const trimmedCanvas = pad.getTrimmedCanvas();
    trimmedCanvas.getContext("2d", { willReadFrequently: true });
    const nextSignature = trimmedCanvas.toDataURL("image/png");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/sign/${estimate.shareCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signerEmail: lockedInviteEmail ?? signerEmail.trim(),
          signatureDataUrl: nextSignature,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to sign estimate.");
      }

      setSignatureDataUrl(nextSignature);
      setSignedAt(payload.signedAt ?? new Date().toISOString());
    } catch (approvalError) {
      setError(
        approvalError instanceof Error
          ? approvalError.message
          : "Unable to sign estimate.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-3 py-6 sm:px-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {estimate.contractor.logoUrl ? (
              <img
                src={estimate.contractor.logoUrl}
                alt={`${contractorName} logo`}
                className="h-10 w-10 rounded-lg border border-slate-200 bg-white object-contain p-1"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-brand text-sm font-extrabold text-white">
                {contractorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900">{contractorName}</p>
              <p className="text-xs text-slate-500">Estimate for review & signature</p>
            </div>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
              isSigned
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[--color-orange-rim] bg-[--color-orange-soft] text-[--color-orange-dark]"
            }`}
          >
            {isSigned ? "Signed" : "Pending"}
          </span>
        </div>

        {/* Estimate Card */}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Estimate Header */}
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
                  Estimate
                </p>
                <h1 className="mt-1 text-xl font-black text-slate-900">
                  {estimate.jobName}
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(estimate.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              {estimate.clientName && (
                <p>
                  <span className="text-xs text-slate-400">Client:</span>{" "}
                  {estimate.clientName}
                </p>
              )}
              {estimate.jobSiteAddress && (
                <p>
                  <span className="text-xs text-slate-400">Site:</span>{" "}
                  {estimate.jobSiteAddress}
                </p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Estimate Details
            </p>
            <div className="space-y-2">
              {summaryRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  <span className="text-slate-700">{row.label}</span>
                  <span className="font-semibold text-slate-900">
                    {formatValue(row.value, row.unit)}
                  </span>
                </div>
              ))}
            </div>

            {/* Materials */}
            {estimate.materialList.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Materials
                </p>
                <div className="space-y-1.5">
                  {estimate.materialList.map((item) => (
                    <p key={item} className="text-sm text-slate-600">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Total */}
            {primaryResult && (
              <div className="mt-4 rounded-xl border border-[--color-orange-soft] bg-[--color-orange-soft] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
                  Total
                </p>
                <p className="mt-0.5 text-2xl font-black text-orange-brand">
                  {typeof primaryResult.value === "number"
                    ? formatCurrency(primaryResult.value)
                    : formatValue(primaryResult.value, primaryResult.unit)}
                </p>
              </div>
            )}
          </div>

          {/* Contact */}
          {(canCall || canMessage) && (
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Questions? Contact {contractorName}
              </p>
              <div className="flex gap-2">
                {canCall && (
                  <a
                    href={`tel:${estimate.contractor.phone}`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-brand px-3 text-xs font-bold text-white transition hover:bg-[--color-orange-dark]"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    Call
                  </a>
                )}
                {canMessage && (
                  <a
                    href={
                      estimate.contractor.phone
                        ? toSmsHref(estimate.contractor.phone)
                        : `mailto:${estimate.contractor.email}`
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-[--color-orange-brand] hover:text-orange-brand"
                  >
                    {estimate.contractor.phone ? (
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                    )}
                    Message
                  </a>
                )}
              </div>
            </div>
          )}
        </article>

        {/* Signature Section */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PencilLine className="h-4 w-4 text-orange-brand" aria-hidden />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
              Customer Signature
            </p>
          </div>

          {isSigned ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  <span className="text-sm font-semibold">Estimate approved & signed</span>
                </div>
                <p className="mt-2 text-sm text-emerald-600">
                  Signed by {signerName || estimate.signing.signerName || "Client"}
                </p>
                <p className="mt-1 text-xs text-emerald-500">
                  {signedAt
                    ? new Date(signedAt).toLocaleString("en-US")
                    : "Signature recorded"}
                </p>
              </div>

              {signatureDataUrl && (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <img
                    src={signatureDataUrl}
                    alt="Signed estimate"
                    className="h-24 w-full object-contain"
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-slate-700">
                  Your Name <span className="text-red-500">*</span>
                  <input
                    value={signerName}
                    onChange={(event) => setSignerName(event.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none transition focus:border-[--color-orange-brand] focus:ring-2 focus:ring-[--color-orange-brand]/20"
                    placeholder="Enter your full name"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  {lockedInviteEmail ? (
                    <>
                      Email <span className="text-red-500">*</span>
                      <span className="ml-1 font-normal text-slate-400">
                        (from your invite)
                      </span>
                    </>
                  ) : (
                    "Email (optional)"
                  )}
                  <input
                    id="signer-email"
                    data-testid="signer-email"
                    value={signerEmail}
                    onChange={(event) => {
                      if (lockedInviteEmail) return;
                      setSignerEmail(event.target.value);
                    }}
                    readOnly={Boolean(lockedInviteEmail)}
                    aria-readonly={lockedInviteEmail ? true : undefined}
                    className={`mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-slate-900 outline-none transition focus:border-[--color-orange-brand] focus:ring-2 focus:ring-[--color-orange-brand]/20 ${
                      lockedInviteEmail
                        ? "cursor-not-allowed bg-slate-100 text-slate-600"
                        : "bg-slate-50"
                    }`}
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs text-slate-500">
                  Draw your signature below
                </p>
                <div className="overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-white">
                  <SignatureCanvas
                    ref={(value) => {
                      signatureRef.current = value;
                    }}
                    penColor="#111827"
                    canvasProps={{
                      className: "h-44 w-full touch-none",
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={submitting}
                  className="inline-flex h-10 flex-[2] items-center justify-center rounded-xl bg-orange-brand px-4 text-sm font-bold text-white transition hover:bg-[--color-orange-dark] disabled:opacity-60"
                >
                  {submitting ? "Signing..." : "Approve & Sign"}
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </article>

        <p className="px-1 text-center text-xs text-slate-400">
          Need a fresh link? Contact the estimator who sent this request.
          <span className="mx-1">|</span>
          <Link href="/" className="text-orange-brand hover:underline">
            Pro Construction Calc
          </Link>
        </p>
      </div>
    </main>
  );
}
