/**
 * Escapes special characters for use in HTML to prevent XSS.
 * @param s The string to escape
 * @returns The escaped string
 */
export function escapeHtml(s: string): string {
  if (typeof s !== "string") return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
