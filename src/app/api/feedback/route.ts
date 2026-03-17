import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { z } from "zod";

const SITE_ALERT_TO = "amj111394@gmail.com";
const FROM_EMAIL = "system@proconstructioncalc.com";
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
  userFacingMessage: z.string().max(1200).optional(),
  userAgent: z.string().max(1200).optional(),
  browserTime: z.string().max(120).optional(),
});

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

export async function POST(req: NextRequest) {
  try {
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
      userFacingMessage,
      userAgent,
      browserTime,
    } = parsed.data;
    const subjectLine =
      rawSubject?.trim() || "Feedback from Pro Construction Calc";
    const subject = `${SUBJECT_PREFIX} ${subjectLine}`;
    const isErrorReport = reportType === "error";

    const contextRows = [
      source ? `<p><strong>Source:</strong> ${escapeHtml(source)}</p>` : "",
      pageUrl ? `<p><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>` : "",
      browserTime ? `<p><strong>Browser Time:</strong> ${escapeHtml(browserTime)}</p>` : "",
      eventId ? `<p><strong>Sentry Event ID:</strong> ${escapeHtml(eventId)}</p>` : "",
      digest ? `<p><strong>Error Digest:</strong> ${escapeHtml(digest)}</p>` : "",
      userFacingMessage
        ? `<p><strong>User-Facing Summary:</strong> ${escapeHtml(userFacingMessage)}</p>`
        : "",
      technicalMessage
        ? `<p><strong>Technical Error:</strong> ${escapeHtml(technicalMessage)}</p>`
        : "",
      userAgent ? `<p><strong>User Agent:</strong> ${escapeHtml(userAgent)}</p>` : "",
    ]
      .filter(Boolean)
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#334155">
  <p><strong>Report Type:</strong> ${isErrorReport ? "Manual error report" : "General feedback"}</p>
  <p><strong>From:</strong> ${escapeHtml(email)}${name ? ` (${escapeHtml(name)})` : ""}</p>
  <p><strong>Subject:</strong> ${escapeHtml(subjectLine)}</p>
  ${contextRows}
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
  <div>${escapeHtml(message)}</div>
  <p style="margin-top:24px;font-size:12px;color:#94a3b8">Sent via Pro Construction Calc contact/feedback form.</p>
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
            "Failed to send. Ensure the 'from' address uses your Resend verified domain (e.g. system@proconstructioncalc.com).",
        },
        { status: 502 }
      );
    }

    if (isErrorReport) {
      Sentry.captureMessage("Manual error report submitted", {
        level: "warning",
        extra: {
          source,
          pageUrl,
          eventId,
          digest,
          technicalMessage,
          userFacingMessage,
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
