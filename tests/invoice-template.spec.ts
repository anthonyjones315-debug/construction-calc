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
    expect(html).toContain("#FF7A00");
    expect(html).toContain("Kitchen Remodel");
  });

  it("escapes malicious input in fields to prevent XSS", () => {
    const maliciousPayload: FinalizeEstimateInput = {
      name: '"><script>alert("XSS")</script>',
      calculator_id: "test",
      client_name: "<b>Malicious</b>",
      job_site_address: "Address & Co",
      total_cost: 100,
      results: [{ label: "<b>Label</b>", value: 10, unit: "<i>Unit</i>" }],
      material_list: ["<img src=x onerror=alert(1)>"],
      inputs: {
        line_items: [
          {
            name: "<u>Item</u>",
            quantity: 1,
            unit: "ea",
            pricePerUnit: 10,
          },
        ],
        quote_note: "<script>alert('note')</script>",
      },
      metadata: {
        title: "Title",
        calculatorLabel: "Label",
        generatedAt: new Date().toISOString(),
        jobName: '"><img src=x>',
      },
    };

    const html = generateInvoiceHtml({
      payload: maliciousPayload,
      contractorName: "<b>Contractor</b>",
      contractorContact: "<u>Contact</u>",
      contractorLogoUrl: '"><script>alert(1)</script>',
    });

    // Check that tags are escaped
    expect(html).not.toContain('"><script>');
    expect(html).not.toContain("<b>");
    expect(html).not.toContain("<u>");
    expect(html).not.toContain("<i>");

    // Check for escaped entities
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;");
  });
});
