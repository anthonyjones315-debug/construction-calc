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

  it("prevents HTML Injection and XSS by escaping user input and sanitizing URLs", () => {
    const maliciousPayload: FinalizeEstimateInput = {
      name: "<script>alert('xss1')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert('xss2')>",
      job_site_address: "<strong>Main St</strong>",
      total_cost: 100,
      results: [
        { label: "<em>Danger</em>", value: "<script>alert('value_xss')</script>", unit: "<i>unit</i>" },
      ],
      material_list: [],
      inputs: {
        selected_county: "Oneida <iframe src='malicious'></iframe>",
        subtotal_cents: 8000,
        tax_cents: 2000,
        total_cents: 10000,
      },
      metadata: {
        title: "Malicious Title",
        calculatorLabel: "<div style='color:red'>Calculator</div>",
        generatedAt: "March 17, 2026",
        jobName: null,
      },
      signature: {
        signerName: "Signer Name",
        signerEmail: "signer@example.com",
        signatureDataUrl: "javascript:alert('xss_sig')",
        signedAt: "March 17, 2026",
      },
    };

    const html = generateInvoiceHtml({
      payload: maliciousPayload,
      contractorName: "<b>Malicious Contractor</b>",
      contractorContact: "<u>555-0101</u>",
      contractorLogoUrl: "javascript:alert('xss_logo')",
    });

    // Verify HTML escaping
    expect(html).not.toContain("<script>alert('xss1')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#39;xss1&#39;)&lt;/script&gt;");

    expect(html).not.toContain("<script>alert('value_xss')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#39;value_xss&#39;)&lt;/script&gt;");

    expect(html).not.toContain("<img src=x onerror=alert('xss2')>");
    expect(html).toContain("&lt;img src=x onerror=alert(&#39;xss2&#39;)&gt;");

    expect(html).not.toContain("<strong>Main St</strong>");
    expect(html).toContain("&lt;strong&gt;Main St&lt;/strong&gt;");

    expect(html).not.toContain("<b>Malicious Contractor</b>");
    expect(html).toContain("&lt;b&gt;Malicious Contractor&lt;/b&gt;");

    expect(html).not.toContain("<u>555-0101</u>");
    expect(html).toContain("&lt;u&gt;555-0101&lt;/u&gt;");

    expect(html).not.toContain("<div style='color:red'>Calculator</div>");
    expect(html).toContain("&lt;div style=&#39;color:red&#39;&gt;Calculator&lt;/div&gt;");

    expect(html).not.toContain("Oneida <iframe src='malicious'></iframe>");
    expect(html).toContain("Oneida &lt;iframe src=&#39;malicious&#39;&gt;&lt;/iframe&gt;");

    // Verify URL sanitization (unsafe javascript: schemas should be rejected/omitted)
    expect(html).not.toContain("javascript:alert('xss_logo')");
    expect(html).not.toContain("javascript:alert('xss_sig')");
  });
});
