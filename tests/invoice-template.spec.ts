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
      name: "<script>alert('xss')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert(1)>",
      job_site_address: "<b>123 Main St</b>",
      quote_note: "<iframe src='http://evil.com'></iframe>",
      total_cost: 100,
      results: [
        { label: "<svg onload=alert(1)>", value: 100, unit: "<i>unit</i>" },
      ],
      material_list: ["<script>bad()</script>"],
      inputs: {
        selected_county: "<b>Oneida</b>",
      },
      metadata: {
        title: "Test",
        calculatorLabel: "<em>Calc</em>",
        generatedAt: "March 17, 2026",
        jobName: "<script>alert('job')</script>",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "javascript:alert('sig')",
        signedAt: null,
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme & Sons <script>",
      contractorContact: "315-555-0100 <b",
      contractorLogoUrl: "javascript:alert('logo')",
    });

    expect(html).not.toContain("<script>alert('job')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#39;job&#39;)&lt;/script&gt;");

    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");

    expect(html).not.toContain("javascript:alert('sig')");
    expect(html).not.toContain("javascript:alert('logo')");
    expect(html).toContain("Acme &amp; Sons &lt;script&gt;");
    expect(html).toContain("&lt;script&gt;bad()&lt;/script&gt;");
  });
});
