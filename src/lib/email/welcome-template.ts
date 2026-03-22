import { designTokens } from "@/lib/design-tokens";

export type WelcomeEmailTemplateInput = {
  fullName: string;
  commandCenterUrl: string;
  signInUrl: string;
  calculatorsUrl: string;
  guideUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getDisplayName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return "there";

  const [firstName] = trimmed.split(/\s+/);
  return firstName || trimmed;
}

export function buildWelcomeEmailHtml(input: WelcomeEmailTemplateInput) {
  const displayName = escapeHtml(getDisplayName(input.fullName));
  const { brand, ui } = designTokens;

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="light" />
      <title>Welcome to Pro Construction Calc</title>
    </head>
    <body style="margin:0;padding:32px 20px;background:${ui.page};color:${ui.text};font-family:Inter,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">
      <div style="max-width:560px;margin:0 auto;">
        <div style="background:${ui.surface};border:1px solid ${ui.border};border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
          <div style="padding:28px 28px 24px;border-bottom:1px solid ${ui.border};">
            <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${brand.orange};">
              Pro Construction Calc
            </p>
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:48px;height:48px;border-radius:14px;background:${brand.orange};color:#ffffff;font-weight:700;font-size:22px;line-height:48px;text-align:center;">
                P
              </div>
              <div>
                <div style="font-size:22px;font-weight:700;color:${ui.text};letter-spacing:-0.02em;line-height:1.2;">
                  Welcome to the team
                </div>
                <div style="margin-top:6px;font-size:14px;color:${ui.textMuted};line-height:1.45;">
                  Your workspace is ready.
                </div>
              </div>
            </div>
          </div>

          <div style="padding:28px;">
            <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:${ui.text};">Hi ${displayName},</p>
            <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${ui.textMuted};">
              Your account is live. Run calculators, save estimates, export PDFs, and keep jobsite math in one place—without tab-hopping or spreadsheet drift.
            </p>
            <p style="margin:0 0 26px;font-size:15px;line-height:1.7;color:${ui.textMuted};">
              Built for crews, estimators, and owners who need fast field numbers and cleaner follow-through.
            </p>

            <a href="${input.commandCenterUrl}" style="display:inline-block;padding:13px 22px;border-radius:12px;background:${brand.orange};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:-0.01em;">
              Open Command Center
            </a>

            <div style="margin-top:26px;padding:20px;border-radius:16px;background:${ui.surfaceAlt};border:1px solid ${ui.border};">
              <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${brand.orange};">
                Start here
              </p>
              <div style="margin-top:4px;">
                <div style="padding:14px 0;border-bottom:1px solid ${ui.border};">
                  <div style="font-size:14px;font-weight:600;color:${ui.text};">Run the numbers</div>
                  <div style="margin-top:6px;font-size:14px;line-height:1.6;color:${ui.textMuted};">Pressure-test quantities in the calculator library before materials get ordered.</div>
                </div>
                <div style="padding:14px 0;border-bottom:1px solid ${ui.border};">
                  <div style="font-size:14px;font-weight:600;color:${ui.text};">Save real work</div>
                  <div style="margin-top:6px;font-size:14px;line-height:1.6;color:${ui.textMuted};">Keep estimates, PDFs, and business math organized in one workspace.</div>
                </div>
                <div style="padding:14px 0 0;">
                  <div style="font-size:14px;font-weight:600;color:${ui.text};">Sharpen the workflow</div>
                  <div style="margin-top:6px;font-size:14px;line-height:1.6;color:${ui.textMuted};">Use the guide and command tools to make repeatable estimating faster for the crew.</div>
                </div>
              </div>
            </div>

            <div style="margin-top:22px;padding:18px 20px;border-radius:16px;border:1px solid rgba(234,88,12,0.18);background:rgba(234,88,12,0.06);">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${brand.orange};">
                Quick links
              </p>
              <p style="margin:0;font-size:14px;line-height:1.75;color:${ui.textMuted};">
                <a href="${input.signInUrl}" style="color:${brand.orangeDark};font-weight:600;text-decoration:none;">Sign in</a>
                <span style="color:#cbd5e1;margin:0 8px;">·</span>
                <a href="${input.calculatorsUrl}" style="color:${brand.orangeDark};font-weight:600;text-decoration:none;">Calculators</a>
                <span style="color:#cbd5e1;margin:0 8px;">·</span>
                <a href="${input.guideUrl}" style="color:${brand.orangeDark};font-weight:600;text-decoration:none;">User guide</a>
              </p>
            </div>

            <p style="margin:26px 0 0;font-size:12px;line-height:1.65;color:${ui.textMuted};">
              You’re receiving this because a Pro Construction Calc account was created with this email. If that wasn’t you, you can ignore this message.
            </p>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

export function buildWelcomeEmailText(input: WelcomeEmailTemplateInput) {
  const displayName = getDisplayName(input.fullName);

  return `Welcome to the team, ${displayName}.

Your Pro Construction Calc account is live.

You can now:
- Run calculators
- Save estimates
- Export PDFs
- Keep your workflow moving from one place

Start here:
- Command Center: ${input.commandCenterUrl}
- Sign in: ${input.signInUrl}
- Calculators: ${input.calculatorsUrl}
- User guide: ${input.guideUrl}

Pro Construction Calc`;
}
