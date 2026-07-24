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

  it("escapes dynamic input data to prevent XSS and HTML injection", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen <script>alert('xss1')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane \"onmouseover=alert('xss2')\"",
      job_site_address: "123 Main St, '><script>alert('xss3')</script>",
      total_cost: 1000,
      results: [
        { label: "Total <script>alert('xss4')</script>", value: 1000, unit: "cents" },
      ],
      material_list: ["Material <script>alert('xss5')</script>"],
      inputs: {
        selected_county: "Oneida",
      },
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring <script>alert('xss6')</script>",
        generatedAt: "March 17, 2026",
        jobName: "Kitchen <script>alert('xss7')</script>",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "javascript:alert('xss8')",
        signedAt: null,
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme <script>alert('contractor')</script>",
      contractorContact: "(315) 555-0101",
      contractorLogoUrl: "javascript:alert('logo')",
    });

    // Check that malicious user inputs are properly escaped and not rendered raw
    expect(html).not.toContain("Kitchen <script>alert('xss1')</script>");
    expect(html).not.toContain("Jane \"onmouseover=alert('xss2')\"");
    expect(html).not.toContain("123 Main St, '><script>alert('xss3')</script>");
    expect(html).not.toContain("javascript:alert('xss8')");
    expect(html).not.toContain("javascript:alert('logo')");

    // Check for proper escape entities
    expect(html).toContain("Kitchen &lt;script&gt;alert(&#x27;xss7&#x27;)&lt;/script&gt;");
    expect(html).toContain("Jane &quot;onmouseover=alert(&#x27;xss2&#x27;)&quot;");
    expect(html).toContain("Material &lt;script&gt;alert(&#x27;xss5&#x27;)&lt;/script&gt;");
  });
});
