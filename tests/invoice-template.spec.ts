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

  it("escapes HTML special characters to prevent HTML/XSS injection", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane <&> Contractor",
      job_site_address: '123 "Main" St',
      total_cost: 100,
      quote_note: "Some 'quote' note <img src=x onerror=alert(1)>",
      results: [
        { label: "Result <Label>", value: "Unsafe <Value>", unit: "cents" },
      ],
      material_list: ["Material <List>"],
      inputs: {
        selected_county: "Oneida",
      },
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring <Calc>",
        generatedAt: "March 17, 2026",
        jobName: "<script>alert('job')</script>",
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
      contractorName: "Acme <Contracting>",
      contractorContact: "Contact <Phone>",
      contractorLogoUrl: null,
    });

    // Verify raw unsafe tags are NOT present in the HTML
    expect(html).not.toContain("<script>alert('name')</script>");
    expect(html).not.toContain("<script>alert('job')</script>");
    expect(html).not.toContain("Jane <&> Contractor");
    expect(html).not.toContain('123 "Main" St');
    expect(html).not.toContain("Some 'quote' note <img src=x onerror=alert(1)>");
    expect(html).not.toContain("Result <Label>");
    expect(html).not.toContain("Unsafe <Value>");
    expect(html).not.toContain("Material <List>");
    expect(html).not.toContain("Flooring <Calc>");
    expect(html).not.toContain("Acme <Contracting>");
    expect(html).not.toContain("Contact <Phone>");

    // Verify safe/escaped versions are present instead
    expect(html).toContain("&lt;script&gt;alert(&#039;job&#039;)&lt;/script&gt;");
    expect(html).toContain("Jane &lt;&amp;&gt; Contractor");
    expect(html).toContain("123 &quot;Main&quot; St");
    expect(html).toContain("Some &#039;quote&#039; note &lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("Result &lt;Label&gt;");
    expect(html).toContain("Unsafe &lt;Value&gt;");
    expect(html).toContain("Material &lt;List&gt;");
    expect(html).toContain("Flooring &lt;Calc&gt;");
    expect(html).toContain("Acme &lt;Contracting&gt;");
    expect(html).toContain("Contact &lt;Phone&gt;");
  });

  it("rejects javascript: schemes inside logo and signature URLs", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane Contractor",
      job_site_address: "123 Main St",
      total_cost: 100,
      results: [],
      material_list: [],
      inputs: {},
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring Waste",
        generatedAt: "March 17, 2026",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "javascript:alert('sig')",
        signedAt: "March 17, 2026",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme Contracting",
      contractorContact: "123",
      contractorLogoUrl: "javascript:alert('logo')",
    });

    // Verify javascript: payloads are not present in src attributes
    expect(html).not.toContain("javascript:alert('logo')");
    expect(html).not.toContain("javascript:alert('sig')");

    // Test with approved URL schemes
    const safePayload: FinalizeEstimateInput = {
      ...payload,
      signature: {
        ...payload.signature,
        signatureDataUrl: "data:image/png;base64,safeSig",
      },
    };
    const safeHtml = generateInvoiceHtml({
      payload: safePayload,
      contractorName: "Acme Contracting",
      contractorContact: "123",
      contractorLogoUrl: "https://example.com/logo.png",
    });

    expect(safeHtml).toContain("data:image/png;base64,safeSig");
    expect(safeHtml).toContain("https://example.com/logo.png");
  });
});
