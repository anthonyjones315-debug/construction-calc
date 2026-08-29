import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

import { POST } from "../../app/api/ai/optimize/route";

describe("/api/ai/optimize Security & Validation", () => {
  const originalEnv = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing or non-string", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calculatorId: 123, results: null }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing required fields.");
  });

  it("returns 503 if ANTHROPIC_API_KEY is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const req = new NextRequest("http://localhost:3000/api/ai/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calculatorId: "concrete", results: "10 cu yds" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe("AI service not configured.");
    process.env.ANTHROPIC_API_KEY = originalEnv;
  });

  it("truncates oversized input strings cleanly", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "Optimized response text." }],
      }),
    } as Response);

    const longCalculatorId = "a".repeat(100);
    const longResults = "b".repeat(3000);
    const longContext = "c".repeat(2000);

    const req = new NextRequest("http://localhost:3000/api/ai/optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.10",
      },
      body: JSON.stringify({
        calculatorId: longCalculatorId,
        results: longResults,
        context: longContext,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(fetchSpy).toHaveBeenCalled();
    const fetchCallArg = fetchSpy.mock.calls[0]?.[1];
    const sentBody = JSON.parse(fetchCallArg?.body as string);
    const sentPrompt = sentBody.messages[0].content;

    expect(sentPrompt).toContain("a".repeat(64));
    expect(sentPrompt).not.toContain("a".repeat(65));

    expect(sentPrompt).toContain("b".repeat(2000));
    expect(sentPrompt).not.toContain("b".repeat(2001));

    expect(sentPrompt).toContain("c".repeat(1000));
    expect(sentPrompt).not.toContain("c".repeat(1001));
  });
});
