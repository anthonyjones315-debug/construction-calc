/**
 * Utility for escaping HTML special characters to prevent XSS.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escapes HTML and converts newlines to <br> tags.
 * Useful for user-provided text blocks.
 */
export function escapeHtmlWithBr(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}
