import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/utils/html";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import type { EstimatePayload } from "@/lib/estimates/types";

describe("Security: HTML Escaping", () => {
  it("escapes special characters correctly", () => {
    const unsafe = '<div>Test "Escape" & \'Single\'</div>';
    const safe = escapeHtml(unsafe);
    expect(safe).toBe("&lt;div&gt;Test &quot;Escape&quot; &amp; &#39;Single&#39;&lt;/div&gt;");
  });
});

describe("Security: Invoice Template XSS Protection", () => {
  const mockPayload: EstimatePayload = {
    id: "test-id",
    name: "<script>alert('name')</script>",
    client_name: "<script>alert('client')</script>",
    job_site_address: "<script>alert('address')</script>",
    total_cost: 1000,
    metadata: {
      calculatorLabel: "<script>alert('label')</script>",
      generatedAt: new Date().toISOString(),
      jobName: "<script>alert('jobName')</script>",
    },
    results: [
      {
        label: "<script>alert('result-label')</script>",
        value: 10,
        unit: "<script>alert('unit')</script>",
      },
    ],
    inputs: {
      control_number: "<script>alert('control')</script>",
      selected_county: "<script>alert('county')</script>",
    },
    quote_note: "<script>alert('note')</script>",
  } as any;

  it("escapes user-controlled fields in generated HTML", () => {
    const html = generateInvoiceHtml({
      payload: mockPayload,
      contractorName: "<script>alert('contractor')</script>",
      contractorContact: "<script>alert('contact')</script>",
      contractorLogoUrl: "javascript:alert('xss')",
    });

    // Check a few critical fields
    expect(html).not.toContain("<script>alert('contractor')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#39;contractor&#39;)&lt;/script&gt;");

    expect(html).not.toContain("<script>alert('client')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#39;client&#39;)&lt;/script&gt;");

    expect(html).not.toContain("<script>alert('note')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#39;note&#39;)&lt;/script&gt;");

    expect(html).not.toContain("javascript:alert('xss')");
    expect(html).toContain("javascript:alert(&#39;xss&#39;)");
  });
});
