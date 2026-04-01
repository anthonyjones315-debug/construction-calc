import { describe, expect, it } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";

describe("generateInvoiceHtml security", () => {
  it("escapes user-provided data to prevent XSS", () => {
    const xssPayload = "<script>alert('xss')</script>";
    const payload: any = {
      name: xssPayload,
      calculator_id: "test/calc",
      client_name: xssPayload,
      job_site_address: xssPayload,
      total_cost: 100,
      results: [
        { label: xssPayload, value: xssPayload, unit: xssPayload },
      ],
      inputs: {
        selected_county: xssPayload,
        control_number: xssPayload,
        line_items: [
          { name: xssPayload, quantity: 1, unit: xssPayload, pricePerUnit: 100 }
        ]
      },
      metadata: {
        title: xssPayload,
        calculatorLabel: xssPayload,
        generatedAt: "2025-01-01",
        jobName: xssPayload,
      },
      quote_note: xssPayload,
      signature: {
        signatureDataUrl: xssPayload,
        signedAt: "2025-01-01",
      }
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: xssPayload,
      contractorContact: xssPayload,
      contractorLogoUrl: xssPayload,
    });

    // Check that the raw XSS payload is NOT present
    expect(html).not.toContain(xssPayload);

    // Check for escaped versions
    const escaped = "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;";
    expect(html).toContain(escaped);

    // Specifically check image srcs are escaped
    expect(html).toContain(`src="${escaped}"`);
  });
});
