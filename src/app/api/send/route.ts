import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const resultRowSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string(),
  description: z.string().optional(),
  highlight: z.boolean().optional(),
});

const estimatePayloadSchema = z.object({
  title: z.string(),
  calculatorLabel: z.string(),
  controlNumber: z.string().nullable().optional(),
  clientName: z.string().nullable().optional(),
  jobSiteAddress: z.string().nullable().optional(),
  results: z.array(resultRowSchema),
  budgetItems: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        pricePerUnit: z.number(),
      })
    )
    .optional(),
  totalCost: z.number().optional(),
  generatedAt: z.string().optional(),
});

const sendSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).optional(),
  estimate: estimatePayloadSchema.optional(),
  replyTo: z.string().email().optional(),
}).refine((d) => d.html !== undefined || d.estimate !== undefined, {
  message: "Provide either html or estimate.",
});

// Verified sender: must use @proconstructioncalc.com for deliverability. Optional override via env.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Pro Construction Calc <estimates@proconstructioncalc.com>";
const LEAD_BCC = process.env.RESEND_LEAD_BCC ?? undefined;

function buildEstimateEmailHtml(estimate: z.infer<typeof estimatePayloadSchema>): string {
  const rows = estimate.results
    .map(
      (r) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">${escapeHtml(r.label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${escapeHtml(String(r.value))} ${escapeHtml(r.unit)}</td></tr>`
    )
    .join("");
  const budget =
    estimate.budgetItems && estimate.budgetItems.length > 0
      ? `<h3 style="color:#0f172a;margin:16px 0 8px">Budget</h3><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:8px 12px;background:#f1f5f9">Item</th><th style="text-align:right;padding:8px 12px;background:#f1f5f9">Qty × Price</th><th style="text-align:right;padding:8px 12px;background:#f1f5f9">Total</th></tr></thead><tbody>${estimate.budgetItems
          .map(
            (b) =>
              `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">${escapeHtml(b.name)}</td><td style="text-align:right;padding:8px 12px;border-bottom:1px solid #e2e8f0">${b.quantity} × $${b.pricePerUnit.toFixed(2)}</td><td style="text-align:right;padding:8px 12px;border-bottom:1px solid #e2e8f0">$${(b.quantity * b.pricePerUnit).toFixed(2)}</td></tr>`
          )
          .join("")}</tbody></table>`
      : "";
  const total =
    estimate.totalCost != null
      ? `<p style="margin-top:12px;font-weight:700;color:#0f172a">Total: $${Number(estimate.totalCost).toFixed(2)}</p>`
      : "";
  const meta = [
    estimate.controlNumber && `Control #: ${escapeHtml(estimate.controlNumber)}`,
    estimate.clientName && `Client: ${escapeHtml(estimate.clientName)}`,
    estimate.jobSiteAddress && `Job site: ${escapeHtml(estimate.jobSiteAddress)}`,
    estimate.generatedAt && `Generated: ${escapeHtml(estimate.generatedAt)}`,
  ]
    .filter(Boolean)
    .join(" &middot; ");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#334155">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
    <div style="width:36px;height:36px;background:#f97316;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px">P</div>
    <span style="font-weight:700;font-size:20px;color:#0f172a">Pro Construction Calc</span>
  </div>
  <h1 style="color:#0f172a;font-size:22px;margin:0 0 8px">${escapeHtml(estimate.title)}</h1>
  <p style="color:#64748b;font-size:14px;margin:0 0 16px">${escapeHtml(estimate.calculatorLabel)}${meta ? ` · ${meta}` : ""}</p>
  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
    <thead><tr><th style="text-align:left;padding:10px 12px;background:#f8fafc;color:#475569">Result</th><th style="text-align:right;padding:10px 12px;background:#f8fafc;color:#475569">Value</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>${budget}${total}
  <p style="margin-top:24px;font-size:12px;color:#94a3b8">This estimate was sent from Pro Construction Calc. Verify all quantities and prices before ordering materials or starting work.</p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  const resend = getResend();
  if (!resend) {
    return NextResponse.json(
      { error: "Email service not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 }
    );
  }

  const { to, subject, html: rawHtml, estimate, replyTo } = parsed.data;
  const html = rawHtml ?? (estimate ? buildEstimateEmailHtml(estimate) : "");

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      ...(replyTo && { reply_to: replyTo }),
      ...(LEAD_BCC && { bcc: [LEAD_BCC] }),
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Failed to send email." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
