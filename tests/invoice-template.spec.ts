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

  it("escapes user-controlled HTML tags to prevent XSS and HTML injection", () => {
    const maliciousPayload: FinalizeEstimateInput = {
      name: "<script>alert('xss-name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert('xss-client')>",
      job_site_address: "123 Main St <iframe src=javascript:alert(1)>",
      quote_note: "<svg/onload=alert('xss-note')>",
      total_cost: 500,
      results: [
        { label: "<b>Dangerous Label</b>", value: 100, unit: "<i>unit</i>" },
      ],
      material_list: ["<script>alert('material')</script>"],
      inputs: {
        line_items: [
          { name: "<a href='javascript:alert(1)'>Click</a>", quantity: 1, unit: "ea", pricePerUnit: 50 },
        ],
      },
      metadata: {
        title: "Test",
        calculatorLabel: "<p>Unsafe Calc</p>",
        generatedAt: "March 17, 2026",
        jobName: "<script>alert('job')</script>",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: null,
        signedAt: null,
      },
    };

    const html = generateInvoiceHtml({
      payload: maliciousPayload,
      contractorName: "<script>alert('contractor')</script>",
      contractorContact: "<b>555-0100</b>",
      contractorLogoUrl: null,
    });

    // Unescaped user-supplied script/img/iframe tags must NOT exist in output HTML
    expect(html).not.toContain("<script>alert('contractor')</script>");
    expect(html).not.toContain("<img src=x onerror=alert('xss-client')>");
    expect(html).not.toContain("<iframe src=javascript:alert(1)>");
    expect(html).not.toContain("<svg/onload=alert('xss-note')>");
    expect(html).not.toContain("<b>Dangerous Label</b>");

    // Escaped entities must be present
    expect(html).toContain("&lt;script&gt;alert(&#039;contractor&#039;)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(&#039;xss-client&#039;)&gt;");
    expect(html).toContain("&lt;svg/onload=alert(&#039;xss-note&#039;)&gt;");
    expect(html).toContain("&lt;script&gt;alert(&#039;material&#039;)&lt;/script&gt;");
    expect(html).toContain("&lt;b&gt;555-0100&lt;/b&gt;");
  });
});
