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
    const maliciousPayload: FinalizeEstimateInput = {
      name: "<script>alert('xss')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert(1)>",
      job_site_address: "<b>123 Main St</b>",
      total_cost: 500,
      results: [
        { label: "<iframe src='evil.com'></iframe>", value: 100, unit: "<svg/onload=alert(2)>" },
      ],
      material_list: ["<script>evil()</script>"],
      quote_note: "<p>Note & 'quote'</p>",
      inputs: {
        selected_county: "Oneida<script>",
        control_number: "CN-<b>123</b>",
      },
      metadata: {
        title: "Title & Test",
        calculatorLabel: "<Calculator>",
        generatedAt: "March 17, 2026",
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
      contractorName: "Malicious <Contractor>",
      contractorContact: "<contact@evil.com>",
      contractorLogoUrl: "https://example.com/logo.png\" style=\"xss",
    });

    expect(html).not.toContain("<script>alert('xss')</script>");
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).not.toContain("<script>evil()</script>");
    expect(html).not.toContain("<iframe src='evil.com'></iframe>");
    expect(html).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&lt;script&gt;evil()&lt;/script&gt;");
    expect(html).toContain("&lt;iframe src=&#39;evil.com&#39;&gt;&lt;/iframe&gt;");
    expect(html).toContain("Malicious &lt;Contractor&gt;");
  });
});
