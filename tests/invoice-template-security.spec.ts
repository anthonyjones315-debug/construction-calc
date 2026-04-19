import { describe, expect, it } from "vitest";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";

describe("generateInvoiceHtml security", () => {
  it("escapes user-provided fields to prevent XSS", () => {
    const payload: any = {
      name: "Kitchen Remodel <script>alert('xss')</script>",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane Contractor <img src=x onerror=alert(1)>",
      job_site_address: "123 Main St, Utica, NY \" onmouseover=\"alert(2)",
      total_cost: 1842.55,
      results: [
        { label: "Total Cents <svg onload=alert(3)>", value: 184255, unit: "cents" },
      ],
      inputs: {
        selected_county: "Oneida",
      },
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Flooring Waste Calculator",
        generatedAt: "2026-03-17T00:00:00.000Z",
        jobName: "Kitchen Remodel <script>",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme Contracting <script>",
      contractorContact: "(315) 555-0101 <script>",
      contractorLogoUrl: "https://example.com/logo.png\" onerror=\"alert(4)",
    });

    expect(html).toContain("Acme Contracting &lt;script&gt;");
    expect(html).toContain("Jane Contractor &lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("123 Main St, Utica, NY &quot; onmouseover=&quot;alert(2)");
    expect(html).toContain("Total Cents &lt;svg onload=alert(3)&gt;");
    expect(html).toContain("logo.png&quot; onerror=&quot;alert(4)");
  });
});
