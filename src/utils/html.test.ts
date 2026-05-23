import { describe, it, expect } from "vitest";
import { escapeHtml } from "./html";

describe("escapeHtml", () => {
  it("escapes special characters", () => {
    const input = '<b> "Me & You" \'25</b>';
    const expected = "&lt;b&gt; &quot;Me &amp; You&quot; &#39;25&lt;/b&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });

  it("handles strings with no special characters", () => {
    const input = "Hello World";
    expect(escapeHtml(input)).toBe(input);
  });

  it("handles empty strings", () => {
    expect(escapeHtml("")).toBe("");
  });
});
