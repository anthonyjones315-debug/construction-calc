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

  it("escapes HTML special characters inside contractor details, client details, estimate, and results to protect against XSS", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "Client <iframe src='foo'></iframe>",
      job_site_address: "Address & Co <script>",
      total_cost: 100,
      results: [
        { label: "Result <label>", value: "value <val>", unit: "unit <ut>" },
      ],
      material_list: ["Material <mat>"],
      inputs: {
        selected_county: "County <cty>",
      },
      metadata: {
        title: "Title <ttl>",
        calculatorLabel: "Label <lbl>",
        generatedAt: "2026-03-17T00:00:00.000Z",
        jobName: "Job <job>",
      },
      quote_note: "Quote <note>",
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: null,
        signedAt: null,
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Contractor <name>",
      contractorContact: "Contact & Phone <contact>",
      contractorLogoUrl: null,
    });

    // Check that raw unsafe HTML sequences from user input are NOT present
    expect(html).not.toContain("<script>alert('name')</script>");
    expect(html).not.toContain("Client <iframe");
    expect(html).not.toContain("Contractor <name>");
    expect(html).not.toContain("Contact & Phone <contact>");
    expect(html).not.toContain("Address & Co <script>");
    expect(html).not.toContain("Job <job>");
    expect(html).not.toContain("Label <lbl>");
    expect(html).not.toContain("Result <label>");
    expect(html).not.toContain("value <val>");
    expect(html).not.toContain("unit <ut>");
    expect(html).not.toContain("Material <mat>");
    expect(html).not.toContain("Quote <note>");

    // Check that they are correctly escaped
    expect(html).toContain("Contractor &lt;name&gt;");
    expect(html).toContain("Contact &amp; Phone &lt;contact&gt;");
    expect(html).toContain("Client &lt;iframe src=&#039;foo&#039;&gt;&lt;/iframe&gt;");
    expect(html).toContain("Address &amp; Co &lt;script&gt;");
    expect(html).toContain("Job &lt;job&gt;");
    expect(html).toContain("Label &lt;lbl&gt;");
    expect(html).toContain("Result &lt;label&gt;");
    expect(html).toContain("value &lt;val&gt;");
    expect(html).toContain("unit &lt;ut&gt;");
    expect(html).toContain("Material &lt;mat&gt;");
    expect(html).toContain("Quote &lt;note&gt;");
  });

  it("escapes HTML special characters inside budget items / line items", () => {
    const payload: FinalizeEstimateInput = {
      name: "Estimate Name",
      calculator_id: "interior/flooring-waste",
      client_name: "Client Name",
      job_site_address: "Address",
      total_cost: 100,
      results: [],
      material_list: [],
      inputs: {
        line_items: [
          {
            name: "Item <name>",
            description: "Desc <desc>",
            quantity: 2,
            unit: "Unit <un>",
            pricePerUnit: 50,
          },
        ],
      },
      metadata: {
        title: "Title",
        calculatorLabel: "Label",
        generatedAt: "2026-03-17T00:00:00.000Z",
        jobName: "Job",
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
      contractorName: "Contractor",
      contractorContact: "Contact",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("Item <name>");
    expect(html).not.toContain("Unit <un>");
    expect(html).toContain("Item &lt;name&gt;");
    expect(html).toContain("Unit &lt;un&gt;");
  });

  it("sanitizes URLs and rejects javascript: schemes inside contractor logo and signature sources", () => {
    const payload: FinalizeEstimateInput = {
      name: "Estimate Name",
      calculator_id: "interior/flooring-waste",
      client_name: "Client Name",
      job_site_address: "Address",
      total_cost: 100,
      results: [],
      material_list: [],
      inputs: {},
      metadata: {
        title: "Title",
        calculatorLabel: "Label",
        generatedAt: "2026-03-17T00:00:00.000Z",
        jobName: "Job",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "javascript:alert('signature')",
        signedAt: "2026-03-17T00:00:00.000Z",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Contractor",
      contractorContact: "Contact",
      contractorLogoUrl: "javascript:alert('logo')",
    });

    // Check that javascript: schemes are rejected and not printed in the sources
    expect(html).not.toContain("javascript:alert");
    expect(html).not.toContain("<img src=\"javascript:");

    // Test safe schemes are accepted
    const payloadSafe: FinalizeEstimateInput = {
      ...payload,
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "data:image/png;base64,safe-signature",
        signedAt: "2026-03-17T00:00:00.000Z",
      },
    };

    const htmlSafe = generateInvoiceHtml({
      payload: payloadSafe,
      contractorName: "Contractor",
      contractorContact: "Contact",
      contractorLogoUrl: "https://example.com/logo.png",
    });

    expect(htmlSafe).toContain("src=\"https://example.com/logo.png\"");
    expect(htmlSafe).toContain("src=\"data:image/png;base64,safe-signature\"");
  });

  it("escapes sanitized URLs to prevent HTML attribute breakout", () => {
    const payload: FinalizeEstimateInput = {
      name: "Estimate Name",
      calculator_id: "interior/flooring-waste",
      client_name: "Client Name",
      job_site_address: "Address",
      total_cost: 100,
      results: [],
      material_list: [],
      inputs: {},
      metadata: {
        title: "Title",
        calculatorLabel: "Label",
        generatedAt: "2026-03-17T00:00:00.000Z",
        jobName: "Job",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "https://example.com/signature.png\" onload=\"alert(1)",
        signedAt: "2026-03-17T00:00:00.000Z",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Contractor",
      contractorContact: "Contact",
      contractorLogoUrl: "https://example.com/logo.png\" onload=\"alert(2)",
    });

    // Check that double quotes inside the URL are escaped to &quot; preventing breakout
    expect(html).not.toContain("https://example.com/logo.png\" onload=\"alert(2)");
    expect(html).not.toContain("https://example.com/signature.png\" onload=\"alert(1)");
    expect(html).toContain("https://example.com/logo.png&quot; onload=&quot;alert(2)");
    expect(html).toContain("https://example.com/signature.png&quot; onload=&quot;alert(1)");
  });
});
