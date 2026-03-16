import "server-only";
/* eslint-disable @next/next/no-head-element */

type SignatureBlock = {
  signerName?: string | null;
  signerEmail?: string | null;
  signatureDataUrl?: string | null;
  signedAt?: string | null;
};

export type ServerEstimateHtmlPayload = {
  estimateName: string;
  jobName: string;
  calculatorLabel: string;
  generatedAt: string;
  brandName: string;
  contractorEmail?: string | null;
  contractorPhone?: string | null;
  logoUrl?: string | null;
  results: Array<{
    label: string;
    value: string | number;
    unit: string;
  }>;
  materialList: string[];
  signature?: SignatureBlock;
};

function toDisplayValue(value: string | number) {
  return typeof value === "number" ? value.toFixed(2) : String(value);
}

function LogoMark() {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="52" height="52" rx="12" fill="#f97316" />
      <path
        d="M17 38V16H28.5C35.4 16 39.5 19.5 39.5 25.6C39.5 31.9 35.1 35.7 28.1 35.7H23.1V38H17ZM23.1 30.8H28C31.4 30.8 33.4 29.1 33.4 25.8C33.4 22.6 31.4 20.9 28 20.9H23.1V30.8Z"
        fill="white"
      />
    </svg>
  );
}

export async function renderEstimatePdfHtml(payload: ServerEstimateHtmlPayload) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const primaryResult = payload.results[0] ?? null;
  const rows =
    payload.materialList.length > 0
      ? payload.materialList.map((item, index) => ({
          key: `${item}-${index}`,
          item,
          value: primaryResult ? toDisplayValue(primaryResult.value) : "Included",
          unit: primaryResult?.unit || "estimate",
        }))
      : payload.results.map((result, index) => ({
          key: `${result.label}-${index}`,
          item: result.label,
          value: toDisplayValue(result.value),
          unit: result.unit,
        }));

  const signature = payload.signature;

  const markup = renderToStaticMarkup(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{payload.estimateName}</title>
        <style>{`
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Inter, Arial, Helvetica, sans-serif;
            color: #0f172a;
            background: #ffffff;
          }
          .page {
            width: 100%;
            padding: 28px 32px 36px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #f97316;
            padding-bottom: 16px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand-name {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.02em;
          }
          .brand-copy {
            margin: 3px 0 0;
            color: #475569;
            font-size: 12px;
          }
          .logo-image {
            width: 54px;
            height: 54px;
            border-radius: 12px;
            object-fit: contain;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            padding: 4px;
          }
          .meta {
            text-align: right;
          }
          .meta-label {
            margin: 0;
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .meta-value {
            margin: 4px 0 10px;
            font-size: 14px;
            font-weight: 700;
          }
          .title {
            margin: 18px 0 4px;
            font-size: 26px;
            font-weight: 800;
          }
          .subtitle {
            margin: 0 0 12px;
            color: #64748b;
            font-size: 14px;
          }
          .contact-grid {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
          }
          .contact-chip {
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
            color: #334155;
            background: #f8fafc;
          }
          .hero {
            margin-top: 14px;
            padding: 14px 16px;
            background: #0f172a;
            color: #ffffff;
            border-radius: 16px;
          }
          .hero-label {
            margin: 0;
            color: #cbd5e1;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .hero-value {
            margin: 8px 0 0;
            font-size: 28px;
            font-weight: 800;
            color: #fb923c;
          }
          .section-title {
            margin: 18px 0 10px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
            border-radius: 14px;
            overflow: hidden;
          }
          th {
            background: #0f172a;
            color: #ffffff;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 10px 12px;
            text-align: left;
          }
          td {
            padding: 11px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          td.value, td.unit, th.value, th.unit {
            text-align: right;
          }
          .signature-block {
            margin-top: 22px;
            border: 1px solid #cbd5e1;
            border-radius: 16px;
            padding: 16px;
            min-height: 160px;
          }
          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            align-items: end;
          }
          .signature-box {
            min-height: 86px;
            border: 1px dashed #94a3b8;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            overflow: hidden;
          }
          .signature-box img {
            max-width: 100%;
            max-height: 78px;
            object-fit: contain;
          }
          .line {
            margin-top: 10px;
            border-top: 1px solid #0f172a;
            padding-top: 6px;
            font-size: 12px;
            color: #475569;
          }
          .muted {
            color: #64748b;
            font-size: 12px;
          }
          .footer {
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            color: #64748b;
            font-size: 11px;
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          <div className="header">
            <div className="brand">
              {payload.logoUrl ? (
                <img
                  src={payload.logoUrl}
                  alt={`${payload.brandName} logo`}
                  className="logo-image"
                />
              ) : (
                <LogoMark />
              )}
              <div>
                <h1 className="brand-name">{payload.brandName}</h1>
                <p className="brand-copy">
                  Material manifest and field-ready estimate
                </p>
              </div>
            </div>
            <div className="meta">
              <p className="meta-label">Date</p>
              <p className="meta-value">{payload.generatedAt}</p>
              <p className="meta-label">Job Name</p>
              <p className="meta-value">{payload.jobName}</p>
            </div>
          </div>

          <h2 className="title">{payload.estimateName}</h2>
          <p className="subtitle">{payload.calculatorLabel}</p>
          {payload.contractorEmail || payload.contractorPhone ? (
            <div className="contact-grid">
              {payload.contractorEmail ? (
                <div className="contact-chip">From: {payload.contractorEmail}</div>
              ) : null}
              {payload.contractorPhone ? (
                <div className="contact-chip">Phone: {payload.contractorPhone}</div>
              ) : null}
            </div>
          ) : null}

          {primaryResult ? (
            <div className="hero">
              <p className="hero-label">Primary Total</p>
              <p className="hero-value">
                {toDisplayValue(primaryResult.value)} {primaryResult.unit}
              </p>
            </div>
          ) : null}

          <h3 className="section-title">Material Manifest</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th className="value">Value</th>
                <th className="unit">Unit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.item}</td>
                  <td className="value">{row.value}</td>
                  <td className="unit">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="signature-block">
            <h3 className="section-title" style={{ marginTop: 0 }}>
              Customer Signature
            </h3>
            <div className="signature-grid">
              <div>
                <div className="signature-box">
                  {signature?.signatureDataUrl ? (
                    <img src={signature.signatureDataUrl} alt="Customer signature" />
                  ) : (
                    <span className="muted">Awaiting signature</span>
                  )}
                </div>
                <div className="line">
                  {signature?.signerName || "Customer Name"}
                  {signature?.signerEmail ? ` · ${signature.signerEmail}` : ""}
                </div>
              </div>
              <div>
                <div className="signature-box">
                  <span className="muted">
                    {signature?.signedAt || "Sign date pending"}
                  </span>
                </div>
                <div className="line">Date Signed</div>
              </div>
            </div>
          </div>

          <div className="footer">
            <span>{payload.contractorEmail || "proconstructioncalc.com"}</span>
            <span>Generated for {payload.brandName}</span>
          </div>
        </div>
      </body>
    </html>,
  );

  return `<!DOCTYPE html>${markup}`;
}
