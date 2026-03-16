"use client";

import Link from "next/link";
import SignatureCanvas from "react-signature-canvas";
import { CheckCircle2, Mail, PencilLine, Phone, RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";

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
  const rendered = typeof value === "number" ? value.toFixed(2) : value;
  return unit ? `${rendered} ${unit}` : rendered;
}

function toSmsHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return `sms:${normalized}`;
}

export function SignEstimateClient({ estimate }: Props) {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [signerName, setSignerName] = useState(estimate.signing.signerName ?? "");
  const [signerEmail, setSignerEmail] = useState(estimate.signing.signerEmail ?? "");
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
  const summaryRows = useMemo(() => estimate.results.slice(0, 4), [estimate.results]);
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
      setError("Enter the client name before signing.");
      return;
    }

    const pad = signatureRef.current;
    if (!pad || pad.isEmpty()) {
      setError("Add a signature before signing the estimate.");
      return;
    }

    const nextSignature = pad.getTrimmedCanvas().toDataURL("image/png");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/sign/${estimate.shareCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signerEmail: signerEmail.trim(),
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
    <main className="min-h-screen bg-slate-950 px-3 py-3 text-slate-100 sm:px-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex min-h-14 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2">
            <div className="flex min-w-0 items-center gap-3">
              {estimate.contractor.logoUrl ? (
                <img
                  src={estimate.contractor.logoUrl}
                  alt={`${contractorName} logo`}
                  className="h-10 w-10 rounded-xl border border-slate-700 bg-white object-contain p-1"
                />
              ) : null}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Estimate Signature
              </p>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {estimate.jobName}
                </p>
                <p className="truncate text-xs text-slate-400">{contractorName}</p>
              </div>
            </div>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-300">
              {isSigned ? "Signed" : "Pending"}
            </span>
          </div>

          <div className="grid gap-3 px-4 py-3 md:grid-cols-2">
            <div className="space-y-3">
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">
                  Estimate Summary
                </p>
                <p className="mt-1.5 text-sm text-slate-200">
                  Client: {estimate.clientName || "Not provided"}
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Job Site: {estimate.jobSiteAddress || "Not provided"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {estimate.calculatorLabel} ·{" "}
                  {new Date(estimate.createdAt).toLocaleDateString("en-US")}
                </p>
                {estimate.contractor.email ? (
                  <p className="mt-2 text-xs text-slate-300">
                    Reply to: {estimate.contractor.email}
                  </p>
                ) : null}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {canCall ? (
                    <a
                      href={`tel:${estimate.contractor.phone}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 text-sm font-bold text-slate-950 transition hover:bg-orange-400"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                      Call {contractorName}
                    </a>
                  ) : null}
                  {canMessage ? (
                    <a
                      href={
                        estimate.contractor.phone
                          ? toSmsHref(estimate.contractor.phone)
                          : `mailto:${estimate.contractor.email}`
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-slate-950 px-3 text-sm font-semibold text-white transition hover:border-orange-400"
                    >
                      {estimate.contractor.phone ? (
                        <Phone className="h-4 w-4" aria-hidden />
                      ) : (
                        <Mail className="h-4 w-4" aria-hidden />
                      )}
                      Message
                    </a>
                  ) : null}
                </div>
              </div>

              {primaryResult ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Primary Total
                  </p>
                  <p className="mt-1.5 text-2xl font-black text-orange-400">
                    {formatValue(primaryResult.value, primaryResult.unit)}
                  </p>
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Material Manifest
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
                  {estimate.materialList.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Quick Totals
                </p>
                <div className="mt-2 space-y-1.5">
                  {summaryRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-300">{row.label}</span>
                      <span className="font-semibold text-white">
                        {formatValue(row.value, row.unit)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="flex items-center gap-2">
                  <PencilLine className="h-4 w-4 text-orange-400" aria-hidden />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                    Customer Signature
                  </p>
                </div>

                {isSigned ? (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        <span className="text-sm font-semibold">Estimate signed</span>
                      </div>
                      <p className="mt-2 text-sm text-emerald-100">
                        Signed by {signerName || estimate.signing.signerName || "Client"}
                      </p>
                      <p className="mt-1 text-xs text-emerald-200/80">
                        {signedAt
                          ? new Date(signedAt).toLocaleString("en-US")
                          : "Signature recorded"}
                      </p>
                    </div>

                    {signatureDataUrl ? (
                      <div className="rounded-2xl border border-slate-800 bg-white p-2">
                        <img
                          src={signatureDataUrl}
                          alt="Signed estimate"
                          className="h-24 w-full object-contain"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <div className="mt-3 grid gap-2">
                      <label className="text-sm text-slate-300">
                        Client Name
                        <input
                          value={signerName}
                          onChange={(event) => setSignerName(event.target.value)}
                          className="mt-1 h-10 w-full rounded-xl border border-slate-500 bg-slate-900 px-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter your full name"
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        Client Email
                        <input
                          value={signerEmail}
                          onChange={(event) => setSignerEmail(event.target.value)}
                          className="mt-1 h-10 w-full rounded-xl border border-slate-500 bg-slate-900 px-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                          placeholder="name@example.com"
                          type="email"
                        />
                      </label>
                    </div>

                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-700 bg-white">
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

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-slate-900 px-4 text-sm font-semibold text-white"
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden />
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={submitting}
                        className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
                      >
                        {submitting ? "Signing..." : "Sign Estimate"}
                      </button>
                    </div>
                  </>
                )}

                {error ? (
                  <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="px-1 text-center text-xs text-slate-500">
          Need a fresh link? Contact the estimator who sent this request.
          <span className="mx-1">|</span>
          <Link href="/" className="text-orange-400 hover:text-orange-300">
            Pro Construction Calc
          </Link>
        </div>
      </div>
    </main>
  );
}
