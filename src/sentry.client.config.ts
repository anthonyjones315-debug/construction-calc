import * as Sentry from "@sentry/nextjs";

const SHOULD_INIT_SENTRY =
  process.env.NODE_ENV === "production" ||
  process.env.SENTRY_ENABLE_IN_DEV === "1";

if (SHOULD_INIT_SENTRY) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
    integrations: [
      // User Feedback widget (manual control from specific pages)
      Sentry.feedbackIntegration({
        autoInject: false,
        colorScheme: "system",
        enableScreenshot: true,
        showBranding: false,
      }),
      // Session Replay so feedback submissions carry context
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    enabled: Boolean(
      process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
    ),
  });
}

