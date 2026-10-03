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

  it("sanitizes user-controlled inputs to prevent XSS and HTML injection", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('xss-name')</script>",
      calculator_id: "test/calc",
      client_name: "<img src=x onerror=alert(1)>",
      job_site_address: "<b>123 Main St</b>",
      total_cost: 100,
      quote_note: "<iframe src=javascript:alert(1)></iframe>",
      results: [
        { label: "<script>alert('label')</script>", value: 50, unit: "<b>ft</b>" },
      ],
      material_list: ["<script>alert('material')</script>"],
      inputs: {
        selected_county: "<script>alert('county')</script>",
      },
      metadata: {
        title: "Test",
        calculatorLabel: "<b>Calc Label</b>",
        generatedAt: "March 17, 2026",
        jobName: "<script>alert('jobName')</script>",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "<script>alert('contractor')</script>",
      contractorContact: "<script>alert('contact')</script>",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>alert");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<iframe");
    expect(html).toContain("&lt;script&gt;alert(&#39;contractor&#39;)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&lt;b&gt;123 Main St&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;alert(&#39;material&#39;)&lt;/script&gt;");
  });
});
