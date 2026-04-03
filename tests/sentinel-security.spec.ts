import { describe, expect, it } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import type { FinalizeEstimateInput } from "@/lib/estimates/finalize";

describe("Sentinel Security: XSS Prevention", () => {
  it("escapes malicious user input in the invoice template", () => {
    const maliciousPayload: FinalizeEstimateInput = {
      name: "Normal Name",
      calculator_id: "test",
      client_name: "<script>alert('xss')</script>",
      job_site_address: "\"> <img src=x onerror=alert(1)>",
      total_cost: 100,
      results: [
        { label: "<b>Dangerous</b>", value: "<u>Underline</u>", unit: "<i>Unit</i>" },
      ],
      material_list: ["Item 1"],
      inputs: {
        control_number: "' OR 1=1 --",
        selected_county: "Oneida'--",
        subtotal_cents: 10000,
        tax_cents: 800,
        total_cents: 10800,
        line_items: [
          {
            name: "<svg onload=alert(1)>",
            quantity: 1,
            unit: "pcs",
            pricePerUnit: 100
          }
        ]
      },
      metadata: {
        title: "Estimate <img src=x>",
        calculatorLabel: "Calc & Label",
        generatedAt: "2026-03-17",
        jobName: "Job ' Quote",
      },
      quote_note: "Note with \"quotes\" and 'single quotes'",
    };

    const html = generateInvoiceHtml({
      payload: {
        ...maliciousPayload,
        signature: {
          signerName: "<script>alert('signer')</script>",
          signedAt: "2026-03-17",
          signatureDataUrl: "data:image/png;base64,123\"><img src=x onerror=alert(1)>",
        },
      },
      contractorName: "<b>Contractor</b>",
      contractorContact: "315-555-5555",
      contractorLogoUrl: "https://example.com/logo.png\"><script>alert(2)</script>",
    });

    // Check that tags are escaped (avoiding the legitimate <script> tag at the end)
    expect(html).not.toContain("<script>alert");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("<b>");
    expect(html).not.toContain("<u>");
    expect(html).not.toContain("<i>");

    // Check for specific escapes
    expect(html).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
    expect(html).toContain("&quot;&gt; &lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&lt;b&gt;Contractor&lt;/b&gt;");
    expect(html).toContain("Calc &amp; Label");
    expect(html).toContain("Job &#39; Quote");
    expect(html).toContain("Note with &quot;quotes&quot; and &#39;single quotes&#39;");
    expect(html).toContain("src=\"https://example.com/logo.png&quot;&gt;&lt;script&gt;alert(2)&lt;/script&gt;\"");
    expect(html).toContain("Oneida&#39;--");
    expect(html).toContain("&#39; OR 1=1 --");
    expect(html).toContain("&lt;script&gt;alert(&#39;signer&#39;)&lt;/script&gt;");
    expect(html).toContain("src=\"data:image/png;base64,123&quot;&gt;&lt;img src=x onerror=alert(1)&gt;\"");
  });
});
