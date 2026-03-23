/**
 * 2FA OTP email — light SaaS system (warm page, white card, restrained accent).
 * Matches app tokens: page #f6f4ef, brand #2563eb.
 */

import { designTokens } from "@/lib/design-tokens";

const { brand, ui } = designTokens;

type OtpEmailInput = {
  code: string;
  siteUrl: string;
  expiryMinutes?: number;
};

export function generateOtpEmailHtml(input: OtpEmailInput): string {
  const { code, siteUrl, expiryMinutes = 5 } = input;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Pro Construction Calc — Security code</title>
</head>
<body style="margin:0;padding:32px 20px;background:${ui.page};color:${ui.text};font-family:Inter,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:480px;margin:0 auto;background:${ui.surface};border:1px solid ${ui.border};border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
    <div style="padding:24px 28px 20px;border-bottom:1px solid ${ui.border};">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:44px;height:44px;border-radius:12px;background:${brand.orange};color:#ffffff;font-weight:700;font-size:20px;line-height:44px;text-align:center;">P</div>
        <div>
          <div style="font-size:18px;font-weight:700;color:${ui.text};letter-spacing:-0.02em;">Pro Construction Calc</div>
          <div style="margin-top:2px;font-size:13px;color:${ui.textMuted};">Security code</div>
        </div>
      </div>
    </div>

    <div style="padding:28px;">
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">
        Use this one-time code to finish signing in:
      </p>

      <div style="margin:0 0 22px;padding:20px 16px;background:#fafaf8;border:1px solid ${ui.border};border-radius:14px;text-align:center;">
        <div style="font-size:32px;letter-spacing:0.28em;font-weight:700;color:${ui.text};font-family:ui-monospace,'SF Mono',Menlo,monospace;">${code}</div>
      </div>

      <p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:${ui.textMuted};">
        This code expires in ${expiryMinutes} minutes and works once.
      </p>

      <div style="padding:14px 16px;background:#eff6ff;border-radius:12px;border:1px solid rgba(37,99,235,0.2);">
        <p style="margin:0;font-size:13px;line-height:1.65;color:#57534e;">
          If you didn’t try to sign in at <span style="color:${brand.orangeDark};font-weight:600;">${siteUrl}</span>, you can ignore this email. Consider updating your password if you’re unsure.
        </p>
      </div>
    </div>

    <div style="padding:16px 28px;background:#fafaf8;border-top:1px solid ${ui.border};text-align:center;">
      <p style="margin:0;font-size:12px;color:${ui.textMuted};">Two-factor authentication enabled on your account</p>
    </div>
  </div>
</body>
</html>
`;
}
