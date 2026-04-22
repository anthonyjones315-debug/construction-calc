import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/utils/html";

describe("escapeHtml security utility", () => {
  it("escapes common HTML special characters", () => {
    const input = '<script>alert("XSS & risk")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS &amp; risk&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  it("escapes single quotes", () => {
    const input = "it's dangerous";
    const expected = "it&#39;s dangerous";
    expect(escapeHtml(input)).toBe(expected);
  });

  it("handles null and undefined gracefully", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("handles non-string inputs by converting to string first", () => {
    expect(escapeHtml(123 as any)).toBe("123");
    expect(escapeHtml(true as any)).toBe("true");
  });
});
