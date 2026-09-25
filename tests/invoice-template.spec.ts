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

  it("escapes user-controlled HTML tags to prevent HTML injection/XSS", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('xss-name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert('xss-client')>",
      job_site_address: "<b>123 Main St</b>",
      quote_note: "<iframe src='http://malicious.com'></iframe>",
      total_cost: 500,
      results: [
        { label: "<svg onload=alert(1)>", value: 500, unit: "<i>sq ft</i>" },
      ],
      material_list: ["<script>alert('xss-mat')</script>"],
      inputs: {
        selected_county: "Oneida",
      },
      metadata: {
        title: "Malicious Estimate",
        calculatorLabel: "<span>Calc</span>",
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
      payload,
      contractorName: "<b>Hacked Contractor</b>",
      contractorContact: "<script>alert('contact')</script>",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>alert");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<b>123 Main St</b>");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("<svg onload");

    expect(html).toContain("&lt;script&gt;alert(&#039;xss-mat&#039;)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(&#039;xss-client&#039;)&gt;");
    expect(html).toContain("&lt;b&gt;Hacked Contractor&lt;/b&gt;");
  });
});
