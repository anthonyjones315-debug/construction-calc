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

  it("escapes user-supplied HTML inputs to prevent HTML injection", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('xss')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert(1)>",
      job_site_address: "<b>123 Main St</b>",
      total_cost: 100,
      results: [
        { label: "<iframe src='evil.com'></iframe>", value: 10, unit: "<svg onload=alert(1)>" },
      ],
      quote_note: "<i>Special discount</i>",
      inputs: {
        selected_county: "<script>alert(2)</script>",
      },
      metadata: {
        title: "Malicious Estimate",
        calculatorLabel: "Custom <Script> Calculator",
        generatedAt: "March 17, 2026",
        jobName: "<script>alert('xss')</script>",
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
      contractorName: "Hacker <Corp>",
      contractorContact: "123-456 <b>Test</b>",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>alert('xss')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");

    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");

    expect(html).not.toContain("<b>123 Main St</b>");
    expect(html).toContain("&lt;b&gt;123 Main St&lt;/b&gt;");

    expect(html).not.toContain("<iframe src='evil.com'></iframe>");
    expect(html).toContain("&lt;iframe src=&#039;evil.com&#039;&gt;&lt;/iframe&gt;");

    expect(html).not.toContain("<svg onload=alert(1)>");
    expect(html).toContain("&lt;svg onload=alert(1)&gt;");

    expect(html).not.toContain("<i>Special discount</i>");
    expect(html).toContain("&lt;i&gt;Special discount&lt;/i&gt;");

    expect(html).not.toContain("Hacker <Corp>");
    expect(html).toContain("Hacker &lt;Corp&gt;");
  });
});
