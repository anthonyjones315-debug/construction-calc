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

  it("escapes user-controlled fields to prevent XSS and HTML injection", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<b>Client</b>",
      job_site_address: "Address & Co",
      total_cost: 100,
      results: [
        { label: "<i>Label</i>", value: 10, unit: "<u>unit</u>" },
      ],
      material_list: ["<s>material</s>"],
      inputs: {},
      metadata: {
        title: "Title",
        calculatorLabel: "Calculator",
        generatedAt: "March 17, 2026",
        jobName: "<script>alert('name')</script>",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "javascript:alert('XSS')",
        signedAt: null,
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "<strong>Contractor</strong>",
      contractorContact: "Contact & Phone",
      contractorLogoUrl: "javascript:alert('logo')",
    });

    // Check that HTML entities are escaped and raw HTML tag structures do not exist
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;alert(&#039;name&#039;)&lt;/script&gt;");

    expect(html).not.toContain("<b>Client</b>");
    expect(html).toContain("&lt;b&gt;Client&lt;/b&gt;");

    expect(html).not.toContain("Address & Co");
    expect(html).toContain("Address &amp; Co");

    expect(html).not.toContain("<i>Label</i>");
    expect(html).toContain("&lt;i&gt;Label&lt;/i&gt;");

    expect(html).not.toContain("<u>unit</u>");
    expect(html).toContain("&lt;u&gt;unit&lt;/u&gt;");

    expect(html).not.toContain("<s>material</s>");
    expect(html).toContain("&lt;s&gt;material&lt;/s&gt;");

    expect(html).not.toContain("<strong>Contractor</strong>");
    expect(html).toContain("&lt;strong&gt;Contractor&lt;/strong&gt;");

    expect(html).not.toContain("Contact & Phone");
    expect(html).toContain("Contact &amp; Phone");

    // Check that javascript: URLs are blocked and not rendered as image sources
    expect(html).not.toContain("javascript:alert");
  });
});
