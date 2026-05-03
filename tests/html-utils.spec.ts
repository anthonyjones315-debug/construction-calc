import { describe, expect, it } from "vitest";
import { escapeHtml, nl2br } from "@/utils/html";

describe("HTML Utilities", () => {
  describe("escapeHtml", () => {
    it("escapes special HTML characters", () => {
      const input = '<script>alert("XSS & attack")</script> \'quoted\'';
      const expected = '&lt;script&gt;alert(&quot;XSS &amp; attack&quot;)&lt;/script&gt; &#039;quoted&#039;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it("handles null and undefined", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
    });
  });

  describe("nl2br", () => {
    it("escapes HTML and converts newlines to <br />", () => {
      const input = "Line 1\n<Line 2>";
      const expected = "Line 1<br />&lt;Line 2&gt;";
      expect(nl2br(input)).toBe(expected);
    });
  });
});
