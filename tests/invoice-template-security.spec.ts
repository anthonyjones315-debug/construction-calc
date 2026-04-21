import { describe, expect, it } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import type { FinalizeEstimateInput } from "@/lib/estimates/finalize";

describe("generateInvoiceHtml security", () => {
  it("escapes user-provided strings to prevent XSS", () => {
    const xss = "<script>alert('xss')</script>";
    const payload: FinalizeEstimateInput = {
      name: `Project ${xss}`,
      calculator_id: "interior/flooring-waste",
      client_name: `Client ${xss}`,
      job_site_address: `Address ${xss}`,
      total_cost: 1000,
      results: [
        { label: `Result ${xss}`, value: 100, unit: `Unit ${xss}` },
      ],
      material_list: [`Material ${xss}`],
      inputs: {
        selected_county: `County ${xss}`,
        control_number: `Control ${xss}`,
        line_items: [
           { name: `LineItem ${xss}`, quantity: 1, unit: `LineUnit ${xss}`, pricePerUnit: 100 }
        ]
      },
      metadata: {
        title: `Title ${xss}`,
        calculatorLabel: `Label ${xss}`,
        generatedAt: "March 17, 2026",
        jobName: `Job ${xss}`,
      },
      signature: {
        signerName: `Signer ${xss}`,
        signerEmail: "signer@example.com",
        signatureDataUrl: "data:image/png;base64,xss",
        signedAt: "2026-03-17T00:00:00Z",
      },
      quote_note: `Note ${xss}`
    };

    const html = generateInvoiceHtml({
      payload: payload as any,
      contractorName: `Contractor ${xss}`,
      contractorContact: `Contact ${xss}`,
      contractorLogoUrl: `https://example.com/logo.png?q=${xss}`,
    });

    // Check that <script> tag is not present in its raw form
    expect(html).not.toContain("<script>alert('xss')</script>");

    // Check that it is escaped
    expect(html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
  });
});
