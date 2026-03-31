import "server-only";

import { Resend } from "resend";

import { escapeHtml } from "@/utils/html";

const FROM_EMAIL = "Pro Construction Calc <owner@proconstructioncalc.com>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
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
          <div style="width:44px;height:44px;border-radius:10px;background:#2563eb;color:#ffffff;font-weight:700;font-size:20px;line-height:44px;text-align:center;box-shadow:0 2px 10px rgba(37,99,235,0.2);">P</div>
          <div>
            <div style="font-size:18px;font-weight:700;letter-spacing:-0.01em;color:#09090B;">Pro Construction Calc</div>
            <div style="margin-top:2px;font-size:13px;color:#71717A;">Signature requested</div>
          </div>
        </div>
        <div style="padding:32px 28px;">
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#27272A;">Hi ${escapeHtml(input.clientName || "there")},</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3F3F46;">
            Your estimate for <strong style="color:#09090B;">${escapeHtml(input.jobName)}</strong> is ready for review and signature.
          </p>
          <div style="margin:24px 0;padding:16px;background:#F4F4F5;border-radius:8px;border:1px solid #E4E4E7;">
            <span style="color:#71717A;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Estimate</span><br />
            <strong style="color:#09090B;font-size:16px;display:inline-block;margin-top:4px;">${escapeHtml(input.estimateName)}</strong>
          </div>
          <a href="${input.signUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 28px;border-radius:8px;box-shadow:0 4px 12px rgba(37,99,235,0.15);">
            Review and sign
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#71717A;line-height:1.65;">
            If the button doesn’t work, open this link in your browser:<br />
            <a href="${input.signUrl}" style="color:#2563eb;font-weight:500;text-decoration:none;word-break:break-all;">${input.signUrl}</a>
          </p>
          ${
            input.contractorName
              ? `<p style="margin:20px 0 0;font-size:13px;color:#71717A;line-height:1.6;border-top:1px solid #E4E4E7;padding-top:20px;">Questions? Reply directly to reach ${escapeHtml(input.contractorName)}.</p>`
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
