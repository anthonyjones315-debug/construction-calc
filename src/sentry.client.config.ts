import * as Sentry from "@sentry/nextjs";

const PII_KEYS = [
  "email",
  "clientEmail",
  "client_email",
  "user_email",
  "name",
  "clientName",
  "client_name",
  "jobSiteAddress",
  "job_site_address",
  "address",
  "phone",
  "businessPhone",
  "businessEmail",
];

function scrubPii(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(scrubPii);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const keyLower = k.toLowerCase();
    const isPii =
      PII_KEYS.some((p) => keyLower.includes(p.toLowerCase())) ||
      /email|name|address|phone/i.test(k);
    out[k] = isPii ? "[REDACTED]" : scrubPii(v);
  }
  return out;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: false,

  beforeSend(event, hint) {
    if (event.extra) {
      event.extra = scrubPii(event.extra) as Record<string, unknown>;
    }
    if (event.contexts && typeof event.contexts === "object") {
      event.contexts = scrubPii(event.contexts) as typeof event.contexts;
    }
    const message = hint.originalException;
    if (message && typeof message === "object" && "message" in message) {
      const msg = String((message as { message: unknown }).message);
      if (
        /@.*\.(com|org|net|io)/.test(msg) ||
        /\b(oneida|county|mohawk|valley)\b/i.test(msg)
      ) {
        (event as { message?: string }).message =
          "[Message redacted for privacy]";
      }
    }
    return event;
  },

  // Launch phase: capture every interaction for Calculator Audit and PWA impact
  tracesSampleRate: 1.0,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Development: forward events to Spotlight (run: npx @spotlightjs/spotlight)
  spotlight: process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SENTRY_SPOTLIGHT === "1",

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  enabled: typeof process.env.NEXT_PUBLIC_SENTRY_DSN === "string" && process.env.NEXT_PUBLIC_SENTRY_DSN.length > 0,
});
