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

  it("escapes HTML special characters inside estimate, contractor, results and notes parameters", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen <script>alert(1)</script> Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane \"Contractor\"",
      job_site_address: "123 & Main St, Utica, NY",
      total_cost: 100,
      results: [
        { label: "Total <Cents>", value: "100", unit: "cents" },
      ],
      inputs: {},
      quote_note: "My note with <markup>",
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring <Waste> Calculator",
        generatedAt: "March 17, 2026",
        jobName: "Kitchen <script>alert(1)</script> Remodel",
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
      contractorName: "Acme & Sons",
      contractorContact: "(315) 555-0101 <tel>",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<Cents>");
    expect(html).not.toContain("<tel>");
    expect(html).not.toContain("<Waste>");
    expect(html).not.toContain("<markup>");
    expect(html).toContain("Kitchen &lt;script&gt;alert(1)&lt;&#x2F;script&gt; Remodel");
    expect(html).toContain("Jane &quot;Contractor&quot;");
    expect(html).toContain("123 &amp; Main St, Utica, NY");
    expect(html).toContain("Total &lt;Cents&gt;");
    expect(html).toContain("Acme &amp; Sons");
    expect(html).toContain("(315) 555-0101 &lt;tel&gt;");
    expect(html).toContain("Flooring &lt;Waste&gt; Calculator");
    expect(html).toContain("My note with &lt;markup&gt;");
  });

  it("sanitizes contractorLogoUrl and signatureDataUrl to reject javascript: schemes", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane Contractor",
      job_site_address: "123 Main St, Utica, NY",
      total_cost: 100,
      results: [],
      inputs: {},
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring Waste Calculator",
        generatedAt: "March 17, 2026",
      },
      signature: {
        signerName: "John",
        signerEmail: "john@example.com",
        signatureDataUrl: "javascript:alert('xss')",
        signedAt: "2026-03-17T00:00:00Z",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme",
      contractorContact: "555",
      contractorLogoUrl: "javascript:alert('logo')",
    });

    expect(html).not.toContain("javascript:alert('logo')");
    expect(html).not.toContain("javascript:alert('xss')");
  });

  it("accepts safe URL schemes like data:image, http and https for logo and signature", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane Contractor",
      job_site_address: "123 Main St, Utica, NY",
      total_cost: 100,
      results: [],
      inputs: {},
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring Waste Calculator",
        generatedAt: "March 17, 2026",
      },
      signature: {
        signerName: "John",
        signerEmail: "john@example.com",
        signatureDataUrl: "data:image/png;base64,abc",
        signedAt: "2026-03-17T00:00:00Z",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme",
      contractorContact: "555",
      contractorLogoUrl: "https://example.com/logo.png",
    });

    expect(html).toContain("https://example.com/logo.png");
    expect(html).toContain("data:image/png;base64,abc");
  });
});
