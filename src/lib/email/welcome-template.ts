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
    .replace(/"/g, "&quot;");
}

function getDisplayName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return "there";

  const [firstName] = trimmed.split(/\s+/);
  return firstName || trimmed;
}

export function buildWelcomeEmailHtml(input: WelcomeEmailTemplateInput) {
  const displayName = escapeHtml(getDisplayName(input.fullName));
  const colors = designTokens;

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Welcome to Pro Construction Calc</title>
    </head>
    <body style="margin:0;padding:24px;background:${colors.ui.page};color:${colors.ui.text};font-family:Inter,Segoe UI,Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;">
        <div style="overflow:hidden;border-radius:28px;background:${colors.ui.midnight};border:1px solid rgba(255,255,255,0.08);box-shadow:0 24px 50px rgba(17,21,29,0.18);">
          <div style="padding:24px 24px 18px;background:radial-gradient(circle at top left, rgba(249,161,90,0.18), transparent 34%), linear-gradient(135deg, rgba(17,21,29,1), rgba(31,37,51,1));color:#ffffff;">
            <div style="display:inline-block;margin-bottom:12px;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">
              Built for the field
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:48px;height:48px;border-radius:14px;background:${colors.brand.orange};color:#ffffff;font-weight:900;font-size:24px;display:flex;align-items:center;justify-content:center;">
                P
              </div>
              <div>
                <div style="font-size:24px;font-weight:900;letter-spacing:0.03em;text-transform:uppercase;">
                  Welcome to the team
                </div>
                <div style="margin-top:4px;font-size:14px;color:rgba(255,255,255,0.75);">
                  Pro Construction Calc is ready when you are.
                </div>
              </div>
            </div>
          </div>

          <div style="padding:24px;background:${colors.ui.surface};">
            <p style="margin:0 0 14px;font-size:16px;line-height:1.65;">Hi ${displayName},</p>
            <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:${colors.ui.textMuted};">
              Your account is live. You can now run calculators, save estimates, export PDFs, and keep your workflow moving without bouncing between tabs or spreadsheets.
            </p>
            <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:${colors.ui.textMuted};">
              We built this for crews, estimators, and owners who need fast jobsite math with cleaner project follow-through.
            </p>

            <a href="${input.commandCenterUrl}" style="display:inline-block;padding:14px 20px;border-radius:16px;background:${colors.brand.orange};color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">
              Open Command Center
            </a>

            <div style="margin-top:22px;padding:18px;border-radius:20px;background:${colors.ui.surfaceAlt};border:1px solid ${colors.ui.border};">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${colors.brand.orange};">
                Start Here
              </div>
              <div style="margin-top:12px;">
                <div style="padding:12px 0;border-bottom:1px solid ${colors.ui.border};">
                  <div style="font-size:14px;font-weight:800;color:${colors.ui.text};text-transform:uppercase;letter-spacing:0.05em;">Run the numbers</div>
                  <div style="margin-top:4px;font-size:14px;line-height:1.6;color:${colors.ui.textMuted};">Open the calculators and pressure-test quantities before materials get ordered.</div>
                </div>
                <div style="padding:12px 0;border-bottom:1px solid ${colors.ui.border};">
                  <div style="font-size:14px;font-weight:800;color:${colors.ui.text};text-transform:uppercase;letter-spacing:0.05em;">Save real work</div>
                  <div style="margin-top:4px;font-size:14px;line-height:1.6;color:${colors.ui.textMuted};">Keep active estimates, PDF exports, and business math in one place.</div>
                </div>
                <div style="padding:12px 0 0;">
                  <div style="font-size:14px;font-weight:800;color:${colors.ui.text};text-transform:uppercase;letter-spacing:0.05em;">Sharpen the workflow</div>
                  <div style="margin-top:4px;font-size:14px;line-height:1.6;color:${colors.ui.textMuted};">Use the guide and command tools to make repeatable estimating faster for the whole crew.</div>
                </div>
              </div>
            </div>

            <div style="margin-top:22px;padding:18px;border-radius:20px;border:1px solid rgba(184,90,16,0.18);background:rgba(249,161,90,0.1);">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${colors.brand.orange};">
                Useful Links
              </div>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:${colors.ui.textMuted};">
                <a href="${input.signInUrl}" style="color:${colors.brand.orangeDark};font-weight:700;text-decoration:none;">Sign in</a>
                &nbsp;·&nbsp;
                <a href="${input.calculatorsUrl}" style="color:${colors.brand.orangeDark};font-weight:700;text-decoration:none;">Calculators</a>
                &nbsp;·&nbsp;
                <a href="${input.guideUrl}" style="color:${colors.brand.orangeDark};font-weight:700;text-decoration:none;">User guide</a>
              </p>
            </div>

            <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:${colors.ui.textMuted};">
              You’re receiving this because a Pro Construction Calc account was created with this email address. If this wasn’t you, you can ignore this message and contact us from the site.
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

Built for the field,
Pro Construction Calc`;
}
