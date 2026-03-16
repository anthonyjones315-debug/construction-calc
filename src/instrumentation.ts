import * as Sentry from "@sentry/nextjs";

const SHOULD_INIT_SENTRY =
  process.env.NODE_ENV === "production" ||
  process.env.SENTRY_ENABLE_IN_DEV === "1";

export async function register() {
  // Next.js loads the instrumentation hook in dev too. Our current Sentry/OTel
  // combo can throw during init (see sentry.server.config), so default to prod-only.
  if (!SHOULD_INIT_SENTRY) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = (
  ...args: Parameters<typeof Sentry.captureRequestError>
) => {
  if (!SHOULD_INIT_SENTRY) return;
  Sentry.captureRequestError(...args);
};
