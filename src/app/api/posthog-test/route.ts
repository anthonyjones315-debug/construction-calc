import { NextResponse } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";

const TEST_EVENT = "server_posthog_test";

/**
 * GET /api/posthog-test — Trigger server-side PostHog capture for verification.
 * Use from browser or: curl -s http://localhost:3000/api/posthog-test
 */
export async function GET() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return NextResponse.json(
      { ok: false, message: "PostHog project token not configured" },
      { status: 503 }
    );
  }

  try {
    const posthog = getPostHogClient();
    const distinctId = "api-test-" + Date.now();
    posthog.capture({
      distinctId,
      event: TEST_EVENT,
      properties: {
        source: "api_route",
        path: "/api/posthog-test",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV ?? "development",
      },
    });
    await posthog.shutdown();

    return NextResponse.json({
      ok: true,
      message: "Server-side PostHog event captured",
      event: TEST_EVENT,
      distinctId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, message: `PostHog capture failed: ${message}` },
      { status: 500 }
    );
  }
}
