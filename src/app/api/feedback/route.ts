import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { z } from "zod";
import { getClientIp } from "@/lib/http/client-ip";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { escapeHtml } from "@/utils/html";

const SITE_ALERT_TO = "owner@proconstructioncalc.com";
const FROM_EMAIL = "Pro Construction Calc <owner@proconstructioncalc.com>";
const SUBJECT_PREFIX = "[PCC-ALERT]";

const feedbackSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(10000),
  reportType: z.enum(["general", "error"]).optional(),
  source: z.string().max(200).optional(),
  pageUrl: z.string().max(2000).optional(),
  eventId: z.string().max(200).optional(),
  digest: z.string().max(200).optional(),
  technicalMessage: z.string().max(4000).optional(),
  userFacingTitle: z.string().max(240).optional(),
  userFacingMessage: z.string().max(1200).optional(),
  userAgent: z.string().max(1200).optional(),
  browserTime: z.string().max(120).optional(),
});

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}


function normalizeString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkMemoryRateLimit("feedback-post", ip, 12, 3600_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSeconds) },
        },
      );
    }

    const resend = getResend();
    if (!resend) {
      return NextResponse.json(
        { error: "Email service not configured." },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      subject: rawSubject,
      message,
      reportType,
      source,
      pageUrl,
      eventId,
      digest,
      technicalMessage,
      userFacingTitle,
      userFacingMessage,
      userAgent,
      browserTime,
    } = parsed.data;
    const sourceValue = normalizeString(source);
    const pageUrlValue = normalizeString(pageUrl);
    const browserTimeValue = normalizeString(browserTime);
    const eventIdValue = normalizeString(eventId);
    const digestValue = normalizeString(digest);
    const technicalMessageValue = normalizeString(technicalMessage);
    const userFacingTitleValue = normalizeString(userFacingTitle);
    const userFacingMessageValue = normalizeString(userFacingMessage);
    const userAgentValue = normalizeString(userAgent);
    const subjectLine =
      normalizeString(rawSubject) || "Feedback from Pro Construction Calc";
    const subject = `${SUBJECT_PREFIX} ${subjectLine}`;
    const isErrorReport = reportType === "error";

    const contextRows = [
      sourceValue ? `<p><strong>Source:</strong> ${escapeHtml(sourceValue)}</p>` : "",
      pageUrlValue ? `<p><strong>Page:</strong> ${escapeHtml(pageUrlValue)}</p>` : "",
      browserTimeValue
        ? `<p><strong>Browser Time:</strong> ${escapeHtml(browserTimeValue)}</p>`
        : "",
      eventIdValue
        ? `<p><strong>Sentry Event ID:</strong> ${escapeHtml(eventIdValue)}</p>`
        : "",
      digestValue ? `<p><strong>Error Digest:</strong> ${escapeHtml(digestValue)}</p>` : "",
      userFacingTitleValue
        ? `<p><strong>User-Facing Title:</strong> ${escapeHtml(userFacingTitleValue)}</p>`
        : "",
      userFacingMessageValue
        ? `<p><strong>User-Facing Summary:</strong> ${escapeHtml(userFacingMessageValue)}</p>`
        : "",
      technicalMessageValue
        ? `<p><strong>Technical Error:</strong> ${escapeHtml(technicalMessageValue)}</p>`
        : "",
      userAgentValue ? `<p><strong>User Agent:</strong> ${escapeHtml(userAgentValue)}</p>` : "",
    ]
      .filter(Boolean)
      .join("");

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="light"></head><body style="margin:0;font-family:Inter,system-ui,sans-serif;background:#f6f4ef;padding:28px 20px;color:#334155;-webkit-font-smoothing:antialiased">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e0db;border-radius:16px;padding:24px 26px;box-shadow:0 4px 24px rgba(15,23,42,0.06)">
  <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb">Pro Construction Calc · Inbox</p>
  <p><strong>Report type:</strong> ${isErrorReport ? "Manual error report" : "General feedback"}</p>
  <p><strong>From:</strong> ${escapeHtml(email)}${name ? ` (${escapeHtml(name)})` : ""}</p>
  <p><strong>Subject:</strong> ${escapeHtml(subjectLine)}</p>
  ${contextRows}
  <hr style="border:none;border-top:1px solid #e2e0db;margin:18px 0">
  <div style="font-size:14px;line-height:1.6">${escapeHtml(message).replace(/\n/g, "<br>")}</div>
  <p style="margin-top:22px;font-size:12px;color:#94a3b8;line-height:1.5">Sent via the site contact / feedback form.</p>
  </div>
</body></html>`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [SITE_ALERT_TO],
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      Sentry.captureMessage(`Resend feedback API error: ${error.message}`, "warning");
      return NextResponse.json(
        {
          error:
            error.message ??
            "Failed to send. Ensure the 'from' address uses your Resend verified domain (e.g. owner@proconstructioncalc.com).",
        },
        { status: 502 }
      );
    }

    if (isErrorReport) {
      Sentry.captureMessage("Manual error report submitted", {
        level: "warning",
        extra: {
          source: sourceValue,
          pageUrl: pageUrlValue,
          eventId: eventIdValue,
          digest: digestValue,
          hasTechnicalMessage: Boolean(technicalMessageValue),
          hasUserFacingMessage: Boolean(userFacingMessageValue),
        },
      });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
