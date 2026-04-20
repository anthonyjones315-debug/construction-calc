import { describe, expect, it } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import type { EstimatePayload } from "@/lib/estimates/types";

describe("generateInvoiceHtml Security", () => {
  it("escapes malicious scripts in all user-controlled fields", () => {
    const maliciousString = '<script>alert("xss")</script>';
    const escapedMaliciousString = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';

    const payload: EstimatePayload = {
      id: "test-id",
      user_id: "user-id",
      name: maliciousString,
      client_name: maliciousString,
      job_site_address: maliciousString,
      quote_note: maliciousString,
      total_cost: 1000,
      results: [
        { label: maliciousString, value: 100, unit: maliciousString },
      ],
      inputs: {
        line_items: [
          { name: maliciousString, quantity: 1, unit: maliciousString, pricePerUnit: 100 }
        ],
        control_number: maliciousString,
        selected_county: maliciousString,
      },
      metadata: {
        title: maliciousString,
        calculatorLabel: maliciousString,
        generatedAt: new Date().toISOString(),
        jobName: maliciousString,
      },
      signature: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: maliciousString,
      contractorContact: maliciousString,
      contractorLogoUrl: null,
    });

    // Check all fields
    expect(html).toContain(escapedMaliciousString);
    expect(html).not.toContain(maliciousString);

    // Verify specific occurrences
    const occurrences = html.split(escapedMaliciousString).length - 1;
    // Contractor Name, Contact, Job Name, Calculator Label, Client Name, Job Address, Line Item Name, Line Item Unit, Result Label, Result Unit, Control Number, Tax Label, Quote Note
    // Some might appear multiple times (e.g., safeContractorName used in title and header)
    expect(occurrences).toBeGreaterThanOrEqual(10);
  });
});
