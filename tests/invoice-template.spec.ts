import { describe, expect, it } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import type { FinalizeEstimateInput } from "@/lib/estimates/finalize";

describe("generateInvoiceHtml", () => {
  it("renders branded contractor and estimate data into the HTML template", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane Contractor",
      job_site_address: "123 Main St, Utica, NY",
      total_cost: 1842.55,
      results: [
        { label: "Total Cents", value: 184255, unit: "cents" },
        { label: "Waste Factor", value: 10, unit: "%" },
      ],
      material_list: ["145 sq ft flooring", "2 boxes trim"],
      inputs: {
        selected_county: "Oneida",
      },
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring Waste Calculator",
        generatedAt: "March 17, 2026",
        jobName: "Kitchen Remodel",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: null,
        signedAt: null,
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme Contracting",
      contractorContact: "(315) 555-0101",
      contractorLogoUrl: null,
    });

    expect(html).toContain("Acme Contracting");
    expect(html).toContain("Jane Contractor");
    expect(html).toContain("145 sq ft flooring");
    expect(html).toContain("Flooring Waste Calculator");
    expect(html).toContain("#ea580c");
    expect(html).toContain("Kitchen Remodel");
  });

  it("escapes user-controlled inputs to prevent HTML injection and XSS", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('xss-name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert('xss-client')>",
      job_site_address: "456 Evil St <iframe src='http://evil.com'></iframe>",
      quote_note: "<b>Note with <script>script</script></b>",
      total_cost: 100,
      results: [
        { label: "<b class='row-label'>Label</b>", value: 10, unit: "<i>unit</i>" },
      ],
      material_list: ["<script>alert('mat')</script>"],
      inputs: {
        line_items: [
          {
            name: "<svg onload=alert(1)>",
            quantity: 1,
            unit: "<b>box</b>",
            unitPrice: 50,
          },
        ],
      },
      metadata: {
        title: "Title",
        calculatorLabel: "<p>Calc</p>",
        generatedAt: "March 17, 2026",
        jobName: null,
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: null,
        signedAt: null,
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "<b>Hacked Contractor</b>",
      contractorContact: "<script>contact</script>",
      contractorLogoUrl: null,
    });

    // Verify raw unescaped tags are NOT present
    expect(html).not.toContain("<script>alert('xss-name')</script>");
    expect(html).not.toContain("<img src=x onerror=alert('xss-client')>");
    expect(html).not.toContain("<iframe src='http://evil.com'></iframe>");
    expect(html).not.toContain("<b>Hacked Contractor</b>");
    expect(html).not.toContain("<svg onload=alert(1)>");
    expect(html).not.toContain("<script>alert('mat')</script>");

    // Verify escaped HTML entities ARE present
    expect(html).toContain("&lt;script&gt;alert(&#39;xss-name&#39;)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(&#39;xss-client&#39;)&gt;");
    expect(html).toContain("&lt;iframe src=&#39;http://evil.com&#39;&gt;&lt;/iframe&gt;");
    expect(html).toContain("&lt;b&gt;Hacked Contractor&lt;/b&gt;");
    expect(html).toContain("&lt;svg onload=alert(1)&gt;");
    expect(html).toContain("&lt;script&gt;alert(&#39;mat&#39;)&lt;/script&gt;");
  });
});
