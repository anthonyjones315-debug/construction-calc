"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0f172a", minHeight: "100vh" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#f97316",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                P
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>
                Pro Construction Calc
              </span>
            </div>
            <div
              style={{
                borderRadius: 16,
                border: "1px solid #334155",
                background: "#1e293b",
                padding: 32,
                boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
              }}
            >
              <h1 style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>
                Something went wrong
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
                An unexpected error occurred. Your data is safe. Try refreshing.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "#f97316",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    background: "#334155",
                    color: "#cbd5e1",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  Go to Home
                </Link>
              </div>
              {error.digest && (
                <p style={{ marginTop: 16, fontSize: 12, color: "#64748b" }}>
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
