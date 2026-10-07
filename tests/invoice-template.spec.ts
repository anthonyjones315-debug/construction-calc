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

  it("sanitizes user inputs against HTML injection and XSS", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('xss-name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert('xss-client')>",
      job_site_address: "<iframe src='evil.com'></iframe>",
      quote_note: "<b>Note:</b> <script>steal()</script>",
      total_cost: 500.0,
      results: [
        { label: "<svg onload=alert(1)>", value: 100, unit: "<b>unit</b>" },
      ],
      material_list: ["<script>xssInMaterial()</script>"],
      inputs: {},
      metadata: {
        title: "XSS Test",
        calculatorLabel: "<p>Unsafe Label</p>",
        generatedAt: "March 17, 2026",
        jobName: "<script>xssJob()</script>",
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
      contractorName: "<b>Hacked Contractor</b>",
      contractorContact: "<a href='javascript:alert(1)'>Call Me</a>",
      contractorLogoUrl: null,
    });

    // Verify raw unescaped HTML tags are NOT present in the output
    expect(html).not.toContain("<script>alert('xss-name')</script>");
    expect(html).not.toContain("<img src=x onerror=alert('xss-client')>");
    expect(html).not.toContain("<iframe src='evil.com'></iframe>");
    expect(html).not.toContain("<b>Hacked Contractor</b>");
    expect(html).not.toContain("<script>xssInMaterial()</script>");

    // Verify escaped entities are present instead
    expect(html).toContain("&lt;img src=x onerror=alert(&#39;xss-client&#39;)&gt;");
    expect(html).toContain("&lt;iframe src=&#39;evil.com&#39;&gt;&lt;/iframe&gt;");
    expect(html).toContain("&lt;b&gt;Hacked Contractor&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;xssInMaterial()&lt;/script&gt;");
  });
});
