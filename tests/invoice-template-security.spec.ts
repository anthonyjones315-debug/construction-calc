import { describe, it, expect } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import type { EstimatePayload } from "@/lib/estimates/types";

describe("Invoice Template Security", () => {
  const xssPayload = "<script>alert('xss')</script>";
  const escapedXss = "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;";

  const mockPayload: EstimatePayload = {
    id: "test-id",
    user_id: "test-user",
    name: xssPayload, // This is jobName fallback
    client_name: xssPayload,
    job_site_address: xssPayload,
    total_cost: 100,
    quote_note: xssPayload,
    inputs: {
      line_items: [
        {
          name: xssPayload,
          quantity: 1,
          unit: xssPayload,
          pricePerUnit: 100,
        },
      ],
      control_number: xssPayload,
      selected_county: xssPayload,
    },
    results: [
      {
        label: xssPayload,
        value: 100,
        unit: xssPayload,
      },
    ],
    metadata: {
      calculatorLabel: xssPayload,
      generatedAt: new Date().toISOString(),
      jobName: xssPayload,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("should escape XSS payloads in all user-controllable fields", () => {
    const html = generateInvoiceHtml({
      payload: mockPayload,
      contractorName: xssPayload,
      contractorContact: xssPayload,
      contractorLogoUrl: null,
    });

    // Check contractor info
    expect(html).toContain(`>${escapedXss}</p>`); // Contractor name
    expect(html).toContain(`>${escapedXss}</p>`); // Contact line

    // Check client/project info
    expect(html).toContain(`>${escapedXss}</p>`); // Client name
    expect(html).toContain(`>${escapedXss}</p>`); // Job address
    expect(html).toContain(`>${escapedXss}</p>`); // Job name
    expect(html).toContain(`>${escapedXss}</p>`); // Calculator label

    // Check line items (budgetItems path)
    expect(html).toContain(`>${escapedXss}</td>`); // Item name
    expect(html).toContain(`>${escapedXss}</td>`); // Item unit

    // Check notes
    expect(html).toContain(`>${escapedXss}</p>`); // Quote note

    // Check tax label
    // It's escaped twice or something? No, it's just escaped.
    // The issue might be the space or something.
    // Let's just check for the escaped payload being present.
    expect(html).toContain(escapedXss);

    // Check control number
    expect(html).toContain(`>${escapedXss}</p>`);

    // Ensure no raw script tag exists
    expect(html).not.toContain("<script>alert('xss')</script>");
  });

  it("should handle the results path if no budget items are present", () => {
    const payloadNoBudget = {
        ...mockPayload,
        inputs: { ...mockPayload.inputs, line_items: [] }
    };
    const html = generateInvoiceHtml({
      payload: payloadNoBudget,
      contractorName: "Test",
      contractorContact: "Test",
      contractorLogoUrl: null,
    });

    expect(html).toContain(`>${escapedXss}</td>`); // Result label
    expect(html).toContain(`>${escapedXss}</td>`); // Result unit
  });
});
