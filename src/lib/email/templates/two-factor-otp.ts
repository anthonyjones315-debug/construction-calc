/**
 * Generate a clean, inline-styled HTML email template for 2FA OTP codes
 * Optimized for headless email delivery via Resend API
 * Uses "Liquid Orange Glass" design system
 */

const BRAND_COLORS = {
  primary: "#FF7A00" /* Safety Orange (base) */,
  primaryLight: "#ff9433" /* Light highlight */,
  primaryDark: "#cc5800" /* Dark shade */,
  primaryGlow: "rgb(255 122 0 / 0.3)" /* Glow effect */,
  primaryRim: "rgb(255 143 31 / 0.8)" /* Rim light */,
  background: "rgba(2, 6, 23, 0.95)" /* Deep background */,
  surface: "rgba(15, 23, 42, 0.85)" /* Primary surface */,
  surfaceElevated: "rgba(30, 41, 59, 0.75)" /* Elevated surface */,
  surfaceFrost: "rgba(255, 255, 255, 0.08)" /* Frosted overlay */,
  border: "rgba(255, 255, 255, 0.08)",
  text: {
    primary: "rgba(255, 255, 255, 0.95)" /* Primary text */,
    secondary: "rgba(255, 255, 255, 0.8)" /* Secondary text */,
    tertiary: "rgba(255, 255, 255, 0.6)" /* Tertiary/hint text */,
    inverse: "rgba(0, 0, 0, 0.9)" /* Inverse text (on light bg) */,
  },
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
  <meta name="color-scheme" content="dark">
  <title>Pro Construction Calc Security Code</title>
</head>
<body style="margin:0;padding:24px;background:#020617;color:${BRAND_COLORS.text.primary};font-family:system-ui,-apple-system,'Inter',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:${BRAND_COLORS.surface};border:1px solid ${BRAND_COLORS.border};border-radius:16px;overflow:hidden;box-shadow:0 16px 24px 0 rgba(0,0,0,0.16), inset 0 0 0 1px rgba(255,255,255,0.05);">
    <!-- Header -->
    <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;gap:12px;background:${BRAND_COLORS.surfaceElevated};">
      <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(to bottom, ${BRAND_COLORS.primaryLight}, ${BRAND_COLORS.primary});color:#ffffff;font-weight:800;font-size:22px;line-height:44px;text-align:center;box-shadow:0 0 12px ${BRAND_COLORS.primaryGlow};">P</div>
      <div>
        <div style="font-size:22px;font-weight:800;color:${BRAND_COLORS.text.primary};text-shadow:0 0 0.8px ${BRAND_COLORS.primaryRim};">Pro Construction Calc</div>
        <div style="font-size:13px;color:${BRAND_COLORS.primaryLight};">Security verification</div>
      </div>
    </div>
    
    <!-- Content -->
    <div style="padding:24px;background:${BRAND_COLORS.surface};">
      <p style="margin:0 0 16px;font-size:15px;color:${BRAND_COLORS.text.primary};">Use this one-time code to finish signing in:</p>
      
      <!-- OTP Display -->
      <div style="margin:0 0 18px;border:1px solid ${BRAND_COLORS.primaryGlow};background:rgba(255,255,255,0.95);border-radius:12px;padding:18px;text-align:center;box-shadow:0 0 5px ${BRAND_COLORS.primaryGlow};">
        <div style="font-size:34px;letter-spacing:0.35em;font-weight:800;color:${BRAND_COLORS.text.inverse};font-family:'JetBrains Mono',ui-monospace,monospace;">${code}</div>
      </div>
      
      <!-- Info Text -->
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND_COLORS.text.secondary};">
        This code expires in ${expiryMinutes} minutes and can only be used once.
      </p>
      
      <!-- Security Notice -->
      <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND_COLORS.text.tertiary};background:rgb(255 122 0 / 0.15);padding:12px;border-radius:8px;border-left:3px solid ${BRAND_COLORS.primary};">
        If you did not try to sign in to ${siteUrl}, you can safely ignore this email and consider updating your password.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,0.1);background:${BRAND_COLORS.surfaceElevated};text-align:center;">
      <p style="margin:0;font-size:12px;color:${BRAND_COLORS.text.tertiary};">Secured with two-factor authentication</p>
    </div>
  </div>
</body>
</html>
`;
}
