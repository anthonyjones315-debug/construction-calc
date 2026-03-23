"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileSignature, X } from "lucide-react";
import { getEstimateDetailRoute, routes } from "@routes";

const ACK_KEY = "pcc_signed_estimates_ack_at";
const SESSION_POPUP_KEY = "pcc_signed_estimates_popup_shown";

type Row = {
  id: string;
  name: string;
  client_name: string | null;
  updated_at: string;
};

export default function SignedEstimatesNotificationsClient() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const since =
      typeof window !== "undefined"
        ? (localStorage.getItem(ACK_KEY) ?? "1970-01-01T00:00:00.000Z")
        : "1970-01-01T00:00:00.000Z";

    async function run() {
      try {
        const res = await fetch(
          `/api/estimates/signed-since?since=${encodeURIComponent(since)}`,
        );
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as {
          count?: number;
          estimates?: Row[];
        };
        const list = Array.isArray(json.estimates) ? json.estimates : [];
        if (cancelled || list.length === 0) return;
        setRows(list);
        if (sessionStorage.getItem(SESSION_POPUP_KEY) !== "1") {
          setPopupOpen(true);
        }
      } catch {
        /* ignore */
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  function acknowledgeAll() {
    localStorage.setItem(ACK_KEY, new Date().toISOString());
    sessionStorage.setItem(SESSION_POPUP_KEY, "1");
    setRows(null);
    setPopupOpen(false);
  }

  function dismissPopupOnly() {
    sessionStorage.setItem(SESSION_POPUP_KEY, "1");
    setPopupOpen(false);
  }

  if (!rows?.length) return null;

  const count = rows.length;
  const preview = rows.slice(0, 3);

  return (
    <>
      {/* Modal overlay and dialog, only when popupOpen is true */}
      <div
        className={`fixed inset-0 z-[85] bg-black/40 transition-opacity duration-200${popupOpen ? "" : " pointer-events-none opacity-0"}`}
        aria-hidden
        onClick={popupOpen ? dismissPopupOnly : undefined}
      >
        {/* Add a close button in the top-right corner for accessibility */}
        {popupOpen && (
          <button
            aria-label="Close notification overlay"
            onClick={dismissPopupOnly}
            className="absolute top-4 right-4 z-[91] rounded-full bg-white/80 p-2 shadow hover:bg-white"
            type="button"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
        )}
      </div>
      {popupOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signed-estimates-popup-title"
          className="fixed left-1/2 top-1/2 z-[90] w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <FileSignature className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="signed-estimates-popup-title"
                className="text-base font-bold text-slate-900"
              >
                {count === 1
                  ? "An estimate was signed"
                  : `${count} estimates were signed`}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                While you were away, client signature(s) came back. Review them
                in your workspace.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                {preview.map((e) => (
                  <li key={e.id} className="truncate">
                    <Link
                      href={getEstimateDetailRoute(e.id)}
                      className="font-medium text-[--color-blue-brand] underline-offset-2 hover:underline"
                    >
                      {e.name}
                    </Link>
                    {e.client_name ? (
                      <span className="text-slate-500"> · {e.client_name}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {count > 3 ? (
                <p className="mt-2 text-xs text-slate-500">
                  +{count - 3} more in Saved Estimates
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={routes.saved}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[--color-blue-brand] px-3 text-sm font-semibold text-white transition hover:bg-[--color-blue-dark]"
                >
                  View saved estimates
                </Link>
                <button
                  type="button"
                  onClick={dismissPopupOnly}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-emerald-950 shadow-sm">
        <FileSignature
          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {count === 1
              ? "New signed estimate"
              : `${count} new signed estimates`}
          </p>
          <p className="mt-0.5 text-xs text-emerald-900/80">
            Client signature(s) arrived since you last cleared notifications.
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            {preview.map((e) => (
              <li key={e.id} className="truncate">
                <Link
                  href={getEstimateDetailRoute(e.id)}
                  className="font-medium text-emerald-800 underline-offset-2 hover:underline"
                >
                  {e.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={routes.saved}
              className="text-xs font-semibold text-emerald-800 underline-offset-2 hover:underline"
            >
              Open Saved Estimates
            </Link>
            <button
              type="button"
              onClick={acknowledgeAll}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Mark all as seen
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={acknowledgeAll}
          className="shrink-0 rounded-lg p-1 text-emerald-700 transition hover:bg-emerald-100"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
