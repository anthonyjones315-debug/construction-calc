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

  it("escapes special HTML characters in user input to prevent XSS/HTML Injection", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('xss-name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane & Co <img src=x onerror=alert(1)>",
      job_site_address: "123 'St' \"Utica\"",
      total_cost: 500,
      results: [{ label: "<b>Result Label</b>", value: 100, unit: "<item>" }],
      material_list: ["<script>alert('mat')</script>"],
      inputs: {
        line_items: [
          { name: "<b>Custom Line Item</b>", quantity: 1, unit: "ea", pricePerUnit: 50 },
        ],
      },
      quote_note: "<iframe src='evil.com'></iframe>",
      metadata: {
        title: "Test",
        calculatorLabel: "Calculator <Tag>",
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
      payload,
      contractorName: "Acme & Sons <script>",
      contractorContact: "<b>555-0101</b>",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>alert('xss-name')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#039;xss-name&#039;)&lt;/script&gt;");
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("Jane &amp; Co &lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("<iframe src='evil.com'></iframe>");
    expect(html).toContain("&lt;iframe src=&#039;evil.com&#039;&gt;&lt;/iframe&gt;");
    expect(html).not.toContain("<b>Custom Line Item</b>");
    expect(html).toContain("&lt;b&gt;Custom Line Item&lt;/b&gt;");
    expect(html).not.toContain("Acme & Sons <script>");
    expect(html).toContain("Acme &amp; Sons &lt;script&gt;");
  });

  it("rejects untrusted javascript: URL schemes in logo and signature sources", () => {
    const payload: FinalizeEstimateInput = {
      name: "Estimate",
      calculator_id: "interior/flooring-waste",
      client_name: "Client",
      job_site_address: "Address",
      total_cost: 100,
      results: [],
      metadata: {
        title: "Test",
        calculatorLabel: "Calculator",
        generatedAt: "March 17, 2026",
      },
      signature: {
        signerName: "Signer",
        signerEmail: "signer@example.com",
        signatureDataUrl: "javascript:alert('signature-xss')",
        signedAt: "2026-03-17T00:00:00Z",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme",
      contractorContact: "555-0101",
      contractorLogoUrl: "javascript:alert('logo-xss')",
    });

    expect(html).not.toContain("javascript:alert('logo-xss')");
    expect(html).not.toContain("javascript:alert('signature-xss')");
  });
});
