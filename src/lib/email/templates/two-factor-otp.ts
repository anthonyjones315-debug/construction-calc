/**
 * Generate a clean, inline-styled HTML email template for 2FA OTP codes
 * Optimized for headless email delivery via Resend API
 * Uses the Pro Construction Calc warm cream / light brand theme
 */

const BRAND = {
  orange: "#ea580c",
  orangeDark: "#c2410c",
  orangeSoft: "#fff4ed",
  page: "#f8f5f0",
  surface: "#ffffff",
  surfaceAlt: "#faf7f3",
  border: "#e7e2d8",
  ink: "#1c1917",
  inkMid: "#57534e",
  inkDim: "#78716c",
} as const;

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
  <title>Pro Construction Calc Security Code</title>
</head>
<body style="margin:0;padding:24px;background:${BRAND.page};color:${BRAND.ink};font-family:system-ui,-apple-system,'Inter',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">

    <!-- Header -->
    <div style="padding:20px 24px;border-bottom:3px solid ${BRAND.orange};display:flex;align-items:center;gap:12px;background:${BRAND.surfaceAlt};">
      <div style="width:44px;height:44px;border-radius:12px;background:${BRAND.orange};color:#ffffff;font-weight:800;font-size:22px;line-height:44px;text-align:center;">P</div>
      <div>
        <div style="font-size:18px;font-weight:900;letter-spacing:0.02em;text-transform:uppercase;color:${BRAND.ink};">Pro Construction Calc</div>
        <div style="font-size:12px;color:${BRAND.orange};font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Security verification</div>
      </div>
    </div>

    <!-- Content -->
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND.ink};line-height:1.6;">Use this one-time code to finish signing in:</p>

      <!-- OTP Display -->
      <div style="margin:0 0 18px;border:2px solid ${BRAND.orange};background:${BRAND.orangeSoft};border-radius:14px;padding:20px;text-align:center;">
        <div style="font-size:38px;letter-spacing:0.4em;font-weight:900;color:${BRAND.orange};font-family:'JetBrains Mono',ui-monospace,monospace;">${code}</div>
      </div>

      <!-- Info Text -->
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.inkMid};">
        This code expires in ${expiryMinutes} minutes and can only be used once.
      </p>

      <!-- Security Notice -->
      <div style="margin:0;padding:12px 14px;background:${BRAND.surfaceAlt};border:1px solid ${BRAND.border};border-left:3px solid ${BRAND.orange};border-radius:8px;">
        <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.inkMid};">
          If you did not try to sign in to <strong style="color:${BRAND.ink};">${siteUrl}</strong>, you can safely ignore this email and consider updating your password.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:14px 24px;border-top:1px solid ${BRAND.border};background:${BRAND.surfaceAlt};text-align:center;">
      <p style="margin:0;font-size:11px;color:${BRAND.inkDim};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Secured with two-factor authentication</p>
    </div>
  </div>
</body>
</html>
`;
}
