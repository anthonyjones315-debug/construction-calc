import { describe, expect, it } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import type { FinalizeEstimateInput } from "@/lib/estimates/finalize";

describe("generateInvoiceHtml security", () => {
  it("escapes malicious HTML in user-provided fields", () => {
    const maliciousString = '<img src=x onerror=alert(1)> " \u0027 &';
    const escapedMaliciousString = '&lt;img src=x onerror=alert(1)&gt; &quot; &#39; &amp;';

    const payload: FinalizeEstimateInput = {
      name: maliciousString,
      calculator_id: "test",
      client_name: maliciousString,
      job_site_address: maliciousString,
      total_cost: 100,
      results: [
        { label: maliciousString, value: 100, unit: maliciousString },
      ],
      material_list: [maliciousString],
      inputs: {
        control_number: maliciousString,
        selected_county: maliciousString,
        line_items: [
          { name: maliciousString, quantity: 1, unit: maliciousString, pricePerUnit: 100 }
        ]
      },
      quote_note: maliciousString,
      metadata: {
        title: maliciousString,
        calculatorLabel: maliciousString,
        generatedAt: "2023-01-01",
        jobName: maliciousString,
      },
      signature: {
        signerName: maliciousString,
        signerEmail: maliciousString,
        signatureDataUrl: maliciousString,
        signedAt: "2023-01-01",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: maliciousString,
      contractorContact: maliciousString,
      contractorLogoUrl: maliciousString,
    });

    // Check various locations in the HTML
    expect(html).not.toContain("<img src=x onerror=alert(1)>");

    // Contractor Name
    expect(html).toContain(escapedMaliciousString);

    // Logo URL (should be escaped in src attribute)
    expect(html).toContain(`src="${escapedMaliciousString}"`);

    // Client Name
    expect(html).toContain(escapedMaliciousString);

    // Quote Note
    expect(html).toContain(escapedMaliciousString);

    // Line Item Description
    expect(html).toContain(escapedMaliciousString);

    // Control Number
    expect(html).toContain(escapedMaliciousString);

    // Signature Data URL
    expect(html).toContain(`src="${escapedMaliciousString}"`);
  });
});
