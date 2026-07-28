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
    expect(html).toContain("Kitchen Remodel");
  });

  it("escapes special HTML characters to prevent XSS / HTML Injection", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen <script>alert('xss')</script> Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane & 'John' <\"Contractor\">",
      job_site_address: "123 Main St, <onload=alert(1)>",
      total_cost: 100,
      results: [
        { label: "Result & <Check>", value: "some \"value\"", unit: "u" },
      ],
      material_list: [], // Leave empty so results are rendered
      inputs: {
        selected_county: "Oneida",
      },
      quote_note: "My <note> & 'other' note",
      metadata: {
        title: "Kitchen Remodel Estimate",
        calculatorLabel: "Calculator <Label>",
        generatedAt: "March 17, 2026",
        jobName: "Kitchen <script>alert('xss')</script> Remodel",
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
      contractorName: "Acme & <Co>",
      contractorContact: "(315) 555-0101 & extra",
      contractorLogoUrl: null,
    });

    // Verify HTML characters are escaped in output
    expect(html).not.toContain("<script>alert('xss')</script>");
    expect(html).toContain("Kitchen &lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt; Remodel");

    expect(html).not.toContain("Jane & 'John' <\"Contractor\">");
    expect(html).toContain("Jane &amp; &#039;John&#039; &lt;&quot;Contractor&quot;&gt;");

    expect(html).not.toContain("123 Main St, <onload=alert(1)>");
    expect(html).toContain("123 Main St, &lt;onload=alert(1)&gt;");

    expect(html).not.toContain("My <note> & 'other' note");
    expect(html).toContain("My &lt;note&gt; &amp; &#039;other&#039; note");

    expect(html).not.toContain("Acme & <Co>");
    expect(html).toContain("Acme &amp; &lt;Co&gt;");

    expect(html).not.toContain("(315) 555-0101 & extra");
    expect(html).toContain("(315) 555-0101 &amp; extra");

    expect(html).not.toContain("Calculator <Label>");
    expect(html).toContain("Calculator &lt;Label&gt;");

    expect(html).not.toContain("Result & <Check>");
    expect(html).toContain("Result &amp; &lt;Check&gt;");
  });

  it("escapes material list items when rendered", () => {
    const payload: FinalizeEstimateInput = {
      name: "Kitchen Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane Contractor",
      job_site_address: "123 Main St",
      total_cost: 100,
      results: [
        { label: "Result", value: 100, unit: "u" },
      ],
      material_list: ["<script>bad</script> flooring"],
      inputs: {},
      metadata: {
        title: "Estimate",
        calculatorLabel: "Calculator",
        generatedAt: "March 17, 2026",
      },
    };

    const html = generateInvoiceHtml({
      payload,
      contractorName: "Acme",
      contractorContact: "123",
      contractorLogoUrl: null,
    });

    expect(html).not.toContain("<script>bad</script>");
    expect(html).toContain("&lt;script&gt;bad&lt;/script&gt; flooring");
  });

  it("sanitizes contractorLogoUrl and signatureDataUrl to allow safe schemes and reject javascript: URLs", () => {
    const basePayload: FinalizeEstimateInput = {
      name: "Kitchen Remodel",
      calculator_id: "interior/flooring-waste",
      client_name: "Jane Contractor",
      job_site_address: "123 Main St",
      total_cost: 100,
      results: [{ label: "R", value: 100, unit: "u" }],
      material_list: [],
      inputs: {},
      metadata: {
        title: "Estimate",
        calculatorLabel: "Calculator",
        generatedAt: "March 17, 2026",
      },
    };

    // 1. Rejected URL: javascript: protocol
    const htmlUnsafe = generateInvoiceHtml({
      payload: {
        ...basePayload,
        signature: {
          signerName: null,
          signerEmail: null,
          signatureDataUrl: "javascript:alert(1)",
          signedAt: "March 17, 2026",
        },
      },
      contractorName: "Acme",
      contractorContact: "123",
      contractorLogoUrl: "javascript:alert(2)",
    });

    expect(htmlUnsafe).not.toContain("javascript:alert(1)");
    expect(htmlUnsafe).not.toContain("javascript:alert(2)");

    // 2. Allowed URLs: data:, http://, https://
    const htmlSafe = generateInvoiceHtml({
      payload: {
        ...basePayload,
        signature: {
          signerName: null,
          signerEmail: null,
          signatureDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          signedAt: "March 17, 2026",
        },
      },
      contractorName: "Acme",
      contractorContact: "123",
      contractorLogoUrl: "https://example.com/logo.png",
    });

    expect(htmlSafe).toContain("data:image/png;base64,");
    expect(htmlSafe).toContain("https://example.com/logo.png");
  });
});
