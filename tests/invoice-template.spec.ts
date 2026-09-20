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

  it("sanitizes untrusted input to prevent HTML injection and XSS", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('xss-name')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<img src=x onerror=alert('xss-client')>",
      job_site_address: "<b>123 Main St</b>",
      total_cost: 500,
      quote_note: "<iframe src='http://malicious.com'></iframe>",
      results: [
        { label: "<script>xss</script>Label", value: 100, unit: "<b>unit</b>" },
      ],
      material_list: ["<script>xssMaterial</script>"],
      inputs: {},
      metadata: {
        title: "Test Title",
        calculatorLabel: "<a href='javascript:alert(1)'>Calc</a>",
        generatedAt: "March 17, 2026",
        jobName: "<u>Malicious Job</u>",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "<script>alert('xss-contractor')</script>",
      contractorContact: "<script>alert('xss-contact')</script>",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>alert('xss-name')</script>");
    expect(html).not.toContain("<img src=x onerror=alert('xss-client')>");
    expect(html).not.toContain("<iframe src='http://malicious.com'></iframe>");
    expect(html).not.toContain("<script>xss</script>");
    expect(html).toContain("&lt;script&gt;alert(&#039;xss-contractor&#039;)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(&#039;xss-client&#039;)&gt;");
    expect(html).toContain("&lt;iframe src=&#039;http://malicious.com&#039;&gt;&lt;/iframe&gt;");
  });
});
