import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/utils/html";

describe("escapeHtml", () => {
  it("escapes special characters", () => {
    expect(escapeHtml("&")).toBe("&amp;");
    expect(escapeHtml("<")).toBe("&lt;");
    expect(escapeHtml(">")).toBe("&gt;");
    expect(escapeHtml('"')).toBe("&quot;");
    expect(escapeHtml("'")).toBe("&#039;");
  });

  it("escapes mixed strings", () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
      "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
    );
    expect(escapeHtml("John & Doe's House")).toBe("John &amp; Doe&#039;s House");
  });

  it("handles empty strings", () => {
    expect(escapeHtml("")).toBe("");
  });
});
