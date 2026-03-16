import "server-only";

import { Resend } from "resend";

const FROM_EMAIL = "system@proconstructioncalc.com";

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
  <html>
    <body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:3px solid #f97316;display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:12px;background:#f97316;color:#ffffff;font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center;">P</div>
          <div>
            <div style="font-size:22px;font-weight:800;">Pro Construction Calc</div>
            <div style="font-size:13px;color:#64748b;">Estimate sign and return</div>
          </div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;">Hi ${escapeHtml(input.clientName || "there")},</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">
            Your estimate for <strong>${escapeHtml(input.jobName)}</strong> is ready for review and signature.
          </p>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.6;">
            Estimate: <strong>${escapeHtml(input.estimateName)}</strong>
          </p>
          <a href="${input.signUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 18px;border-radius:14px;">
            Review and Sign Estimate
          </a>
          <p style="margin:18px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
            If the button does not open, copy this link into your browser:
            <br />
            <a href="${input.signUrl}" style="color:#ea580c;">${input.signUrl}</a>
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
