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

  it("escapes user-controlled fields against XSS/HTML Injection", () => {
    const maliciousPayload: FinalizeEstimateInput = {
      name: "<script>alert('xss')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "Client <img src=x onerror=alert(1)>",
      job_site_address: "Address & Co",
      total_cost: 100,
      results: [
        { label: "Result <label>", value: 10, unit: "unit <unit>" },
      ],
      material_list: ["Material <list>"],
      inputs: {
        selected_county: "County <county>",
      },
      metadata: {
        title: "Title <title>",
        calculatorLabel: "Calculator <label>",
        generatedAt: "March 17, 2026",
        jobName: "Job <name>",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: null,
        signedAt: null,
      },
    };

    const html = generateInvoiceHtml({
      payload: maliciousPayload,
      contractorName: "Contractor <name>",
      contractorContact: "Contact <contact>",
      contractorLogoUrl: null,
    });

    // Verify all special characters are escaped
    expect(html).not.toContain("<script>alert");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("Address & Co");
    expect(html).not.toContain("Result <label>");
    expect(html).not.toContain("unit <unit>");
    expect(html).not.toContain("Material <list>");
    expect(html).not.toContain("Calculator <label>");
    expect(html).not.toContain("Job <name>");
    expect(html).not.toContain("Contractor <name>");
    expect(html).not.toContain("Contact <contact>");

    // Expect escaped values to exist
    expect(html).toContain("Client &lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("Address &amp; Co");
    expect(html).toContain("Result &lt;label&gt;");
    expect(html).toContain("unit &lt;unit&gt;");
    expect(html).toContain("Material &lt;list&gt;");
    expect(html).toContain("Calculator &lt;label&gt;");
    expect(html).toContain("Job &lt;name&gt;");
    expect(html).toContain("Contractor &lt;name&gt;");
    expect(html).toContain("Contact &lt;contact&gt;");
  });

  it("rejects javascript: schemes and accepts/escapes safe URL schemes in logo and signature Data URLs", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane Contractor",
      job_site_address: "123 Main St, Utica, NY",
      total_cost: 1842.55,
      results: [],
      material_list: [],
      inputs: {},
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring Waste Calculator",
        generatedAt: "March 17, 2026",
        jobName: "Kitchen Remodel",
      },
      signature: {
        signerName: null,
        signerEmail: null,
        signatureDataUrl: "javascript:alert('xss')",
        signedAt: "2026-03-17T00:00:00Z",
      },
    };

    // 1. Test javascript: scheme rejection
    const htmlWithMaliciousUrl = generateInvoiceHtml({
      payload,
      contractorName: "Acme Contracting",
      contractorContact: "(315) 555-0101",
      contractorLogoUrl: "javascript:alert('xss_logo')",
    });

    // Logo image should not render with malicious url
    expect(htmlWithMaliciousUrl).not.toContain("javascript:alert('xss_logo')");
    // Signature image should not render with malicious url
    expect(htmlWithMaliciousUrl).not.toContain("javascript:alert('xss')");

    // 2. Test safe URL schemes being accepted and escaped
    const safePayload: FinalizeEstimateInput = {
      ...payload,
      signature: {
        ...payload.signature,
        signatureDataUrl: "data:image/png;base64,safe_sig_data\" onerror=\"alert(1)",
      },
    };

    const htmlWithSafeUrl = generateInvoiceHtml({
      payload: safePayload,
      contractorName: "Acme Contracting",
      contractorContact: "(315) 555-0101",
      contractorLogoUrl: "https://example.com/logo.png?param=1&name=test\" onerror=\"alert(2)",
    });

    // Check safe logo is escaped (specifically the double quote that tries to breakout)
    expect(htmlWithSafeUrl).toContain("https://example.com/logo.png?param=1&amp;name=test&quot; onerror=&quot;alert(2)");
    expect(htmlWithSafeUrl).not.toContain("onerror=\"alert(2)");

    // Check safe signature is escaped
    expect(htmlWithSafeUrl).toContain("data:image/png;base64,safe_sig_data&quot; onerror=&quot;alert(1)");
    expect(htmlWithSafeUrl).not.toContain("onerror=\"alert(1)");
  });
});
