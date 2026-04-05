import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/utils/html";

describe("escapeHtml", () => {
  it("escapes all five critical characters", () => {
    const input = "& < > \" '";
    const expected = "&amp; &lt; &gt; &quot; &#39;";
    expect(escapeHtml(input)).toBe(expected);
  });

  it("handles a complex mixed string", () => {
    const input = "<script>alert(\"XSS & 'more'\");</script>";
    const expected = "&lt;script&gt;alert(&quot;XSS &amp; &#39;more&#39;&quot;);&lt;/script&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });

  it("handles strings with no special characters", () => {
    const input = "Hello World 123";
    expect(escapeHtml(input)).toBe("Hello World 123");
  });

  it("handles empty strings", () => {
    expect(escapeHtml("")).toBe("");
  });
});
