import * as Sentry from "@sentry/nextjs";

const SHOULD_INIT_SENTRY =
  process.env.NODE_ENV === "production" ||
  process.env.SENTRY_ENABLE_IN_DEV === "1";

if (SHOULD_INIT_SENTRY) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    skipOpenTelemetrySetup: true,

    sendDefaultPii: false,

    // Launch phase: full trace sampling
    tracesSampleRate: 1.0,

    enabled: Boolean(
      process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
    ),
  });
}
