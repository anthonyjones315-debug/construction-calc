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

  it("sanitizes user inputs to prevent HTML injection and XSS", () => {
    const payload: FinalizeEstimateInput = {
      name: "Remodel & Addition <script>",
      calculator_id: "interior/flooring-waste",
      client_name: "John <img src=x onerror=alert(1)> Doe",
      job_site_address: "123 Main St & 'Quote'",
      total_cost: 500,
      quote_note: "<iframe src=javascript:alert(1)></iframe>",
      results: [
        { label: "Item <b style='color:red'>X</b>", value: 500, unit: "sq ft <tag>" },
      ],
      material_list: ["<script>bad()</script> Oak Planks"],
      inputs: {
        selected_county: "Erie",
      },
      metadata: {
        title: "Estimate",
        calculatorLabel: "<b>Custom Calc</b>",
        generatedAt: "March 17, 2026",
        jobName: "Remodel & Addition <script>",
      },
      signature: {
        signerName: "Signer <Name>",
        signerEmail: "test@example.com",
        signatureDataUrl: "https://example.com/logo.png\" onload=\"alert(1)",
        signedAt: "2026-03-17T00:00:00Z",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Evil <script>Corp</script>",
      contractorContact: "555 & 1234",
      contractorLogoUrl: "http://example.com/logo.png' onerror='alert(1)",
    });

    expect(html).not.toContain("Remodel & Addition <script>");
    expect(html).toContain("Remodel &amp; Addition &lt;script&gt;");

    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("John &lt;img src=x onerror=alert(1)&gt; Doe");

    expect(html).not.toContain("<script>bad()</script>");
    expect(html).toContain("&lt;script&gt;bad()&lt;/script&gt; Oak Planks");

    expect(html).not.toContain("Evil <script>Corp</script>");
    expect(html).toContain("Evil &lt;script&gt;Corp&lt;/script&gt;");

    expect(html).not.toContain("logo.png\" onload=\"alert(1)");
    expect(html).toContain("logo.png&quot; onload=&quot;alert(1)");

    expect(html).not.toContain("<iframe src=javascript:alert(1)>");
    expect(html).toContain("&lt;iframe src=javascript:alert(1)&gt;&lt;/iframe&gt;");
  });
});
