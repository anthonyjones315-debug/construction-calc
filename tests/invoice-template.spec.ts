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

  it("escapes user-controlled text and rejects dangerous image protocols to prevent XSS", () => {
    const payload: FinalizeEstimateInput = {
      name: "<b>XSS</b>",
      calculator_id: "interior/flooring-waste",
      client_name: "<script>alert('client')</script>",
      job_site_address: "Address with \"quotes\" & ampersands",
      total_cost: 100.00,
      results: [
        { label: "Result <label>", value: "Value <val>", unit: "unit <ut>" },
      ],
      material_list: ["Material <mat>"],
      inputs: {
        control_number: "Control <ctrl>",
        selected_county: "County <cty>",
        subtotal_cents: 10000,
        tax_cents: 800,
        total_cents: 10800,
      },
      metadata: {
        title: "Title <t>",
        calculatorLabel: "Label <lbl>",
        generatedAt: "2026-03-17T00:00:00Z",
      },
      quote_note: "Note <note>",
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "javascript:alert('signature')",
        signedAt: "2026-03-17T00:00:00Z",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Contractor <name>",
      contractorContact: "Contact <phone>",
      contractorLogoUrl: "javascript:alert('logo')",
    });

    // Check escaping
    expect(html).not.toContain("<b>XSS</b>");
    expect(html).toContain("&lt;b&gt;XSS&lt;/b&gt;");

    expect(html).not.toContain("<script>alert('client')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#39;client&#39;)&lt;/script&gt;");

    expect(html).not.toContain("Result <label>");
    expect(html).toContain("Result &lt;label&gt;");

    expect(html).not.toContain("Value <val>");
    expect(html).toContain("Value &lt;val&gt;");

    expect(html).not.toContain("unit <ut>");
    expect(html).toContain("unit &lt;ut&gt;");

    expect(html).not.toContain("Material <mat>");
    expect(html).toContain("Material &lt;mat&gt;");

    expect(html).not.toContain("Control <ctrl>");
    expect(html).toContain("Control &lt;ctrl&gt;");

    expect(html).not.toContain("Label <lbl>");
    expect(html).toContain("Label &lt;lbl&gt;");

    expect(html).not.toContain("Note <note>");
    expect(html).toContain("Note &lt;note&gt;");

    expect(html).not.toContain("Contractor <name>");
    expect(html).toContain("Contractor &lt;name&gt;");

    expect(html).not.toContain("Contact <phone>");
    expect(html).toContain("Contact &lt;phone&gt;");

    // Check rejection of javascript: URLs
    expect(html).not.toContain("javascript:alert('signature')");
    expect(html).not.toContain("javascript:alert('logo')");
  });
});
