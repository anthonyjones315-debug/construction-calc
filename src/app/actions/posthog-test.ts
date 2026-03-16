"use server";

import { getPostHogClient } from "@/lib/posthog-server";

const TEST_EVENT = "server_posthog_test";

/**
 * Server action to verify server-side PostHog (posthog-node) capture.
 * Call from a client component or trigger via the API route to test.
 */
export async function captureServerPostHogTest(): Promise<{
  ok: boolean;
  message: string;
  event?: string;
}> {
  const token =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!token) {
    return { ok: false, message: "PostHog project token not configured" };
  }

  try {
    const posthog = getPostHogClient();
    const distinctId = "server-test-" + Date.now();
    posthog.capture({
      distinctId,
      event: TEST_EVENT,
      properties: {
        source: "server_action",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV ?? "development",
      },
    });
    await posthog.shutdown();
    return { ok: true, message: "Server-side PostHog event captured", event: TEST_EVENT };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `PostHog capture failed: ${message}` };
  }
}
