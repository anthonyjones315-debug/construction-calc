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
      name: "Test Name",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert(1)>",
      job_site_address: "123 Main St & 'Quoted'",
      quote_note: "<iframe src=javascript:alert(1)></iframe>",
      results: [
        { label: "<b>Dangerous Label</b>", value: 100, unit: "<i>unit</i>" },
      ],
      material_list: ["<script>bad()</script>"],
      metadata: {
        title: "Test",
        calculatorLabel: "Calc & Test",
        generatedAt: "March 17, 2026",
        jobName: "<script>alert('xss')</script>",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Contractor <A>",
      contractorContact: "phone & email",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>alert('xss')</script>");
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).not.toContain("<iframe src=javascript:alert(1)></iframe>");
    expect(html).not.toContain("<b>Dangerous Label</b>");
    expect(html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&lt;b&gt;Dangerous Label&lt;/b&gt;");
    expect(html).toContain("Contractor &lt;A&gt;");
    expect(html).toContain("&lt;script&gt;bad()&lt;/script&gt;");
  });
});
