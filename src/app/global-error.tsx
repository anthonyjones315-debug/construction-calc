"use client";

import * as Sentry from "@sentry/nextjs";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { ManualErrorReportButton } from "@/components/support/ManualErrorReportButton";
import { getUserFacingErrorDetails } from "@/lib/errors/user-facing";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const lowerMessage = error.message.toLowerCase();
    const isMathIntegrityError =
      lowerMessage.includes("check constraint") ||
      lowerMessage.includes("check violation") ||
      lowerMessage.includes("total_cents");

    Sentry.captureException(error, {
      tags: {
        global_boundary: "true",
        math_integrity: String(isMathIntegrityError),
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  const userFacing = getUserFacingErrorDetails(error, {
    title: "The app hit a system error",
    message:
      "We couldn’t finish loading the app. Try again, and if the problem sticks around send us a backup report.",
  });

  return (
    <html lang="en" className="command-theme light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-bg: #f6f4ef;
                --color-surface: #ffffff;
                --color-border: #e2e0db;
                --color-ink: #0f1117;
                --color-ink-mid: #334155;
                --color-ink-dim: #64748b;
                --color-orange-brand: #ea580c;
                --color-orange-dark: #c2410c;
                --color-text-primary: rgba(2, 6, 23, 0.96);
                --color-text-secondary: rgba(15, 23, 42, 0.84);
                --color-text-tertiary: rgba(51, 65, 85, 0.78);
              }
              body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-ink); }
              .glass-container-elevated {
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: 1rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.06);
              }
              .glass-button {
                border: 1px solid var(--color-border);
                border-radius: 0.5rem;
                background: var(--color-surface);
                color: var(--color-ink-mid);
                padding: 0.5rem 1rem;
                cursor: pointer;
              }
              .glass-button-primary {
                border: 1px solid var(--color-orange-brand);
                border-radius: 0.5rem;
                background: var(--color-orange-brand);
                color: #fff;
                padding: 0.5rem 1rem;
                cursor: pointer;
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
          <div className="glass-container-elevated relative max-w-lg overflow-hidden p-8 text-center">
            <div className="flex flex-col items-center">
              <TriangleAlert className="mb-4 h-12 w-12 text-red-400" aria-hidden />
              <h1 className="text-xl font-black uppercase tracking-wide text-copy-primary">
                {userFacing.title}
              </h1>
              <p className="mt-3 text-sm text-copy-secondary">
                {userFacing.message}
              </p>
              {error.digest ? (
                <p className="mt-2 text-xs text-copy-tertiary">
                  Reference: {error.digest}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="glass-button px-4 py-2 text-sm font-medium"
                >
                  Try Again
                </button>
                <ManualErrorReportButton
                  error={error}
                  source="global-error-boundary"
                  buttonLabel="Report Issue"
                  className="glass-button-primary px-4 py-2 text-sm font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
