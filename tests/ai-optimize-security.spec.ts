import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/ai/optimize/route";

describe("AI Optimize API route security & validation", () => {
  const originalEnv = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
  });

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns 400 when calculatorId or results are non-string types", async () => {
    const req = new Request("http://localhost/api/ai/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calculatorId: 12345,
        results: "valid results",
      }),
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing or invalid required fields.");
  });

  it("truncates excessively long inputs before building prompt", async () => {
    let capturedBody: any = null;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url, opts) => {
        if (url.toString().includes("api.anthropic.com")) {
          capturedBody = JSON.parse(opts.body);
          return Promise.resolve({
            ok: true,
            json: async () => ({
              content: [{ type: "text", text: "Optimized recommendations" }],
            }),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      }),
    );

    const hugeCalculatorId = "a".repeat(200);
    const hugeResults = "b".repeat(5000);
    const hugeContext = "c".repeat(2000);

    const req = new Request("http://localhost/api/ai/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calculatorId: hugeCalculatorId,
        results: hugeResults,
        context: hugeContext,
      }),
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(capturedBody).not.toBeNull();
    const promptText = capturedBody.messages[0].content;

    // Check that calculatorId was truncated to 100
    expect(promptText).toContain("Calculator: " + "a".repeat(100));
    expect(promptText).not.toContain("a".repeat(101));

    // Check that results was truncated to 4000
    expect(promptText).toContain("b".repeat(4000));
    expect(promptText).not.toContain("b".repeat(4001));

    // Check that context was truncated to 1000
    expect(promptText).toContain("c".repeat(1000));
    expect(promptText).not.toContain("c".repeat(1001));
  });
});
