import "server-only";
import { Resend } from "resend";
import { generateOtpEmailHtml } from "./templates/two-factor-otp";

const FROM_EMAIL = "security@proconstructioncalc.com";
const FROM_NAME = "Pro Construction Calc Security";
const DEFAULT_SITE_URL = "https://proconstructioncalc.com";
const TWO_FACTOR_EXPIRY_MINUTES = 5;

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export async function sendTwoFactorCodeEmail(input: {
  to: string;
  code: string;
}) {
  const resend = getResend();
  if (!resend) {
    throw new Error("Email service not configured.");
  }

  const siteUrl = getSiteUrl();
  const subject = "Security Code for Pro Construction Calc | Time-Sensitive";

  // Generate email content using the new template
  const html = generateOtpEmailHtml({
    code: input.code,
    siteUrl,
    expiryMinutes: TWO_FACTOR_EXPIRY_MINUTES,
  });

  // Plain text fallback
  const text = [
    "Pro Construction Calc security verification",
    "",
    `Your one-time security code is: ${input.code}`,
    "",
    `This code expires in ${TWO_FACTOR_EXPIRY_MINUTES} minutes and can only be used once.`,
    `If you did not try to sign in to ${siteUrl}, you can ignore this email.`,
  ].join("\n");

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [input.to],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Failed to send two-factor email.");
  }
}
