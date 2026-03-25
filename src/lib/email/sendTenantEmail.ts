import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL ?? "Pro Construction Calc <noreply@proconstructioncalc.com>";

type SendTenantEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  tenantEmail?: string | null;
  from?: string;
};

/**
 * Sends an email via Resend with dynamic reply-to injection.
 * The `from` address stays on the central sending domain, while `replyTo`
 * routes client replies directly back to the contractor who initiated the action.
 */
export async function sendTenantEmail({
  to,
  subject,
  html,
  tenantEmail,
  from,
}: SendTenantEmailArgs) {
  const payload: Parameters<typeof resend.emails.send>[0] = {
    from: from ?? DEFAULT_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };

  // Dynamic reply-to: route replies to the contractor
  if (tenantEmail) {
    payload.replyTo = tenantEmail;
  }

  const result = await resend.emails.send(payload);

  return result;
}
