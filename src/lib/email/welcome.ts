import "server-only";

import { Resend } from "resend";
import { routes } from "@routes";
import {
  buildWelcomeEmailHtml,
  buildWelcomeEmailText,
} from "@/lib/email/welcome-template";

const FROM_EMAIL = "system@proconstructioncalc.com";
const DEFAULT_SITE_URL = "https://proconstructioncalc.com";

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

function buildAbsoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export async function sendWelcomeEmail(input: {
  to: string;
  fullName: string;
}) {
  const resend = getResend();
  if (!resend) {
    throw new Error("Email service not configured.");
  }

  const commandCenterUrl = buildAbsoluteUrl(routes.commandCenter);
  const signInUrl = buildAbsoluteUrl(
    `${routes.auth.signIn}?callbackUrl=${encodeURIComponent(routes.commandCenter)}`,
  );
  const calculatorsUrl = buildAbsoluteUrl(routes.calculators);
  const guideUrl = buildAbsoluteUrl(routes.guide);

  const subject = "Welcome to the team | Pro Construction Calc";
  const html = buildWelcomeEmailHtml({
    fullName: input.fullName,
    commandCenterUrl,
    signInUrl,
    calculatorsUrl,
    guideUrl,
  });
  const text = buildWelcomeEmailText({
    fullName: input.fullName,
    commandCenterUrl,
    signInUrl,
    calculatorsUrl,
    guideUrl,
  });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [input.to],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Failed to send welcome email.");
  }
}
