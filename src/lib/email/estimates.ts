import "server-only";

import { Resend } from "resend";

const FROM_EMAIL = "Pro Construction Calc <owner@proconstructioncalc.com>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEstimateSignatureEmail(input: {
  to: string;
  clientName?: string | null;
  estimateName: string;
  jobName: string;
  signUrl: string;
  contractorName?: string | null;
  replyTo?: string | null;
}) {
  const resend = getResend();
  if (!resend) {
    throw new Error("Email service not configured.");
  }

  const subject = `Signature requested: ${input.estimateName}`;
  const html = `<!DOCTYPE html>
  <html lang="en">
    <head><meta charset="utf-8"><meta name="color-scheme" content="light"></head>
    <body style="margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;background:#f6f4ef;color:#0f172a;padding:32px 20px;-webkit-font-smoothing:antialiased;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e0db;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
        <div style="padding:22px 26px;border-bottom:1px solid #e2e0db;display:flex;align-items:center;gap:14px;">
          <div style="width:44px;height:44px;border-radius:12px;background:#ea580c;color:#ffffff;font-weight:700;font-size:20px;line-height:44px;text-align:center;">P</div>
          <div>
            <div style="font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;">Pro Construction Calc</div>
            <div style="margin-top:2px;font-size:13px;color:#64748b;">Signature requested</div>
          </div>
        </div>
        <div style="padding:28px 26px;">
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">Hi ${escapeHtml(input.clientName || "there")},</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#475569;">
            Your estimate for <strong style="color:#0f172a;">${escapeHtml(input.jobName)}</strong> is ready for review and signature.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#475569;">
            <span style="color:#64748b;">Estimate</span> · <strong style="color:#0f172a;">${escapeHtml(input.estimateName)}</strong>
          </p>
          <a href="${input.signUrl}" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:12px;">
            Review and sign
          </a>
          <p style="margin:22px 0 0;font-size:13px;color:#64748b;line-height:1.65;">
            If the button doesn’t work, open this link in your browser:<br />
            <a href="${input.signUrl}" style="color:#c2410c;font-weight:600;text-decoration:none;word-break:break-all;">${input.signUrl}</a>
          </p>
          ${
            input.contractorName
              ? `<p style="margin:18px 0 0;font-size:13px;color:#64748b;line-height:1.6;">Questions? Reply directly to reach ${escapeHtml(input.contractorName)}.</p>`
              : ""
          }
        </div>
      </div>
    </body>
  </html>`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [input.to],
    subject,
    html,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  });

  if (error) {
    throw new Error(error.message || "Failed to send signature email.");
  }
}
