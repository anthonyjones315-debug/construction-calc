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

  it("HTML-escapes user-controlled inputs to prevent HTML injection and XSS", () => {
    const payload: FinalizeEstimateInput = {
      name: '<script>alert("xss")</script>',
      calculator_id: "interior/flooring-waste",
      client_name: '<b onmouseover="alert(1)">Evil Client</b>',
      job_site_address: '123 Fake St <iframe src="javascript:alert(1)"></iframe>',
      total_cost: 100,
      quote_note: 'Dangerous note <img src=x onerror="alert(1)">',
      results: [
        { label: '<b>Label</b>', value: '<script>alert(1)</script>', unit: '<i>unit</i>' },
      ],
      material_list: ['<script>alert("mat")</script>'],
      inputs: {
        control_number: 'EST-<img src=x onerror=alert(1)>',
        line_items: [
          {
            name: '<svg onload=alert(1)>',
            quantity: 1,
            unit: '<b/onclick=alert(1)>',
            pricePerUnit: 50,
          },
        ],
      },
      metadata: {
        title: "Security Test",
        calculatorLabel: '<a href="http://attacker.com">Evil Link</a>',
        generatedAt: "March 17, 2026",
        jobName: '<script>alert("xss")</script>',
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: 'Acme & Sons <script>alert("contractor")</script>',
      contractorContact: '555-0100 <img src=x onerror=alert(1)>',
      contractorLogoUrl: null,
    });

    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

    expect(html).not.toContain('<b onmouseover="alert(1)">Evil Client</b>');
    expect(html).toContain('&lt;b onmouseover=&quot;alert(1)&quot;&gt;Evil Client&lt;/b&gt;');

    expect(html).not.toContain('<svg onload=alert(1)>');
    expect(html).toContain('&lt;svg onload=alert(1)&gt;');

    expect(html).not.toContain('<img src=x onerror="alert(1)">');
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');

    expect(html).not.toContain('Acme & Sons <script>');
    expect(html).toContain('Acme &amp; Sons &lt;script&gt;');
  });
});
