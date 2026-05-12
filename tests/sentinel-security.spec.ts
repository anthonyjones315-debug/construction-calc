import { describe, expect, it } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import { escapeHtml } from "@/utils/html";

describe("generateInvoiceHtml Security", () => {
  it("escapes user-controlled data to prevent XSS", () => {
    const xssPayload = "<script>alert('xss')</script>";
    const payload: any = {
      name: xssPayload,
      client_name: xssPayload,
      job_site_address: xssPayload,
      results: [
        { label: xssPayload, value: 100, unit: xssPayload },
      ],
      inputs: {
        control_number: xssPayload,
        selected_county: xssPayload,
      },
      metadata: {
        jobName: xssPayload,
        calculatorLabel: xssPayload,
        generatedAt: "2025-01-01",
      },
      signature: {
        signatureDataUrl: xssPayload,
      }
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: xssPayload,
      contractorContact: xssPayload,
      contractorLogoUrl: xssPayload,
    });

    const escapedXss = escapeHtml(xssPayload);

    // Check that the raw XSS payload is NOT present (except maybe in some non-rendered field if I missed any, but the goal is to check rendered ones)
    expect(html).not.toContain(xssPayload);

    // Check that the escaped version IS present
    expect(html).toContain(escapedXss);
  });
});
