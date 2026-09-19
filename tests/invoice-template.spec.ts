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

  it("sanitizes user inputs against HTML Injection and XSS vulnerabilities", () => {
    const payload: FinalizeEstimateInput = {
      name: "<script>alert('xss')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "<b>Evil Client</b>",
      job_site_address: "123 <iframe src=x> St",
      total_cost: 500,
      quote_note: "<img src=x onerror=alert(1)>",
      results: [{ label: "<span onclick=bad()>Label</span>", value: 10, unit: "<svg onload=alert(1)>" }],
      material_list: ["<script>bad()</script>"],
      inputs: {},
      metadata: {
        title: "Test",
        calculatorLabel: "Calculator <script>",
        generatedAt: "March 17, 2026",
        jobName: "<script>alert('xss')</script>",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "<b>Bad Company</b>",
      contractorContact: "<script>alert(2)</script>",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>alert('xss')</script>");
    expect(html).not.toContain("<b>Evil Client</b>");
    expect(html).not.toContain("<iframe src=x>");
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).not.toContain("<b>Bad Company</b>");

    expect(html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    expect(html).toContain("&lt;b&gt;Evil Client&lt;/b&gt;");
    expect(html).toContain("&lt;iframe src=x&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&lt;b&gt;Bad Company&lt;/b&gt;");
  });
});
