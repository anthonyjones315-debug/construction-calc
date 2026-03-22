import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createServerClient } from "@/lib/supabase/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { getClientIp } from "@/lib/http/client-ip";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
const FORMSPREE_URL = "https://formspree.io/f/xyknwlrz";
const CONSENT_VERSION = "2026-03-13";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkMemoryRateLimit("leads-signup", ip, 3, 600_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests." },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSeconds) },
        },
      );
    }

    let body: {
      email?: string;
      source?: string;
      marketingConsent?: boolean;
      consentVersion?: string;
    };
    try {
      body = (await req.json()) as {
        email?: string;
        source?: string;
        marketingConsent?: boolean;
        consentVersion?: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const email = (body.email ?? "").trim().toLowerCase();
    const source = (body.source ?? "unknown").slice(0, 50);
    const consentVersion = (body.consentVersion ?? "").slice(0, 32);
    const marketingConsent = body.marketingConsent === true;
    const userAgent = (req.headers.get("user-agent") ?? "unknown").slice(0, 500);

    if (!EMAIL_RE.test(email) || email.length > 320) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!marketingConsent || consentVersion !== CONSENT_VERSION) {
      return NextResponse.json(
        { error: "Explicit marketing consent is required." },
        { status: 400 },
      );
    }

    const db = createServerClient();
    const { error: dbError } = await db.from("email_signups").insert({
      email,
      source,
      marketing_consent: true,
      consent_text:
        "I agree to receive product updates and launch emails at this address. If marketing emails are sent, they will include unsubscribe instructions.",
      consent_version: consentVersion,
      consent_recorded_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    });

    if (dbError && dbError.code !== "23505") {
      Sentry.captureException(dbError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, source }),
    }).catch(() => {});

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: "lead_signup",
      properties: { source },
    });
    posthog.identify({
      distinctId: email,
      properties: { email },
    });
    await posthog.shutdown();

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
