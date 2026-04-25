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

  it("escapes user input to prevent XSS", () => {
    const xssPayload: any = {
      name: "<b>XSS Name</b>",
      calculator_id: "test",
      client_name: "<script>alert('xss')</script>",
      job_site_address: "Address with \"quotes\"",
      total_cost: 100,
      results: [
        { label: "<i>Label</i>", value: 100, unit: "<u>Unit</u>" },
      ],
      inputs: {
        selected_county: "Oneida",
        control_number: "CN-<b>123</b>",
        subtotal_cents: 10000,
        tax_cents: 800,
        total_cents: 10800,
      },
      metadata: {
        title: "Title",
        calculatorLabel: "Label & <more>",
        generatedAt: "2026-03-17",
        jobName: null, // Force use of payload.name
      },
      quote_note: "Line 1\nLine 2 <script>",
    };

    const html = generateInvoiceHtml({
      payload: xssPayload,
      contractorName: "Contractor & Co",
      contractorContact: "Contact <info>",
      contractorLogoUrl: null,
    });

    // Verify everything is escaped
    expect(html).toContain("&lt;b&gt;XSS Name&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
    expect(html).toContain("Address with &quot;quotes&quot;");
    expect(html).toContain("&lt;i&gt;Label&lt;/i&gt;");
    expect(html).toContain("&lt;u&gt;Unit&lt;/u&gt;");
    expect(html).toContain("Tax (Oneida County)");
    expect(html).toContain("CN-&lt;b&gt;123&lt;/b&gt;");
    expect(html).toContain("Label &amp; &lt;more&gt;");
    expect(html).toContain("Contractor &amp; Co");
    expect(html).toContain("Contact &lt;info&gt;");
    expect(html).toContain("Line 1<br>Line 2 &lt;script&gt;");

    // Negative checks
    expect(html).not.toContain("<b>XSS Name</b>");
    expect(html).not.toContain("<script>alert(");
  });
});
