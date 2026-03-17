/**
 * Generate a clean, inline-styled HTML email template for 2FA OTP codes
 * Optimized for headless email delivery via Resend API
 */

const BRAND_COLORS = {
  primary: '#f97316',
  primaryDark: '#c2410c',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    tertiary: '#475569'
  }
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
<body style="margin:0;padding:24px;background:${BRAND_COLORS.background};color:${BRAND_COLORS.text.primary};font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:${BRAND_COLORS.surface};border:1px solid ${BRAND_COLORS.border};border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="padding:20px 24px;border-bottom:3px solid ${BRAND_COLORS.primary};display:flex;align-items:center;gap:12px;">
      <div style="width:44px;height:44px;border-radius:12px;background:${BRAND_COLORS.primary};color:${BRAND_COLORS.surface};font-weight:800;font-size:22px;line-height:44px;text-align:center;">P</div>
      <div>
        <div style="font-size:22px;font-weight:800;">Pro Construction Calc</div>
        <div style="font-size:13px;color:${BRAND_COLORS.text.secondary};">Security verification</div>
      </div>
    </div>
    
    <!-- Content -->
    <div style="padding:24px;">
      <p style="margin:0 0 12px;font-size:15px;">Use this one-time code to finish signing in:</p>
      
      <!-- OTP Display -->
      <div style="margin:0 0 18px;border:1px solid ${BRAND_COLORS.border};background:${BRAND_COLORS.surface};border-radius:12px;padding:18px;text-align:center;">
        <div style="font-size:34px;letter-spacing:0.35em;font-weight:800;color:${BRAND_COLORS.primaryDark};">${code}</div>
      </div>
      
      <!-- Info Text -->
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND_COLORS.text.tertiary};">
        This code expires in ${expiryMinutes} minutes and can only be used once.
      </p>
      
      <!-- Security Notice -->
      <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND_COLORS.text.secondary};">
        If you did not try to sign in to ${siteUrl}, you can safely ignore this email and consider updating your password.
      </p>
    </div>
  </div>
</body>
</html>
`;
}
