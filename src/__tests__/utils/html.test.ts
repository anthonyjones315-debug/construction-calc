import { describe, it, expect } from "vitest";
import { escapeHtml } from "@/utils/html";

describe("escapeHtml", () => {
  it("should escape special characters", () => {
    const input = '<b>"Me & You"\'s</b>';
    const expected = "&lt;b&gt;&quot;Me &amp; You&quot;&#39;s&lt;/b&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });

  it("should handle null and undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("should handle numbers", () => {
    expect(escapeHtml(123)).toBe("123");
    expect(escapeHtml(0)).toBe("0");
  });

  it("should convert newlines to <br /> when nl2br is true", () => {
    const input = "Line 1\nLine 2";
    const expected = "Line 1<br />Line 2";
    expect(escapeHtml(input, { nl2br: true })).toBe(expected);
  });

  it("should not convert newlines to <br /> by default", () => {
    const input = "Line 1\nLine 2";
    // Default implementation does not replace newlines
    expect(escapeHtml(input)).toContain("\n");
  });

  it("should escape special characters even when nl2br is true", () => {
    const input = "<b>Line 1</b>\nLine 2";
    const expected = "&lt;b&gt;Line 1&lt;/b&gt;<br />Line 2";
    expect(escapeHtml(input, { nl2br: true })).toBe(expected);
  });
});
