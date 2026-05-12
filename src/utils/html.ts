/**
 * Escapes special characters for use in HTML to prevent XSS.
 * @param s The string to escape.
 * @returns The escaped string.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escapes special characters for use in HTML and converts newlines to <br> tags.
 * @param s The string to escape.
 * @returns The escaped string with <br> tags.
 */
export function escapeHtmlWithBr(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br>");
}
