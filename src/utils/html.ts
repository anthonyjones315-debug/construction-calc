/**
 * Safely escape HTML special characters to prevent XSS.
 * Standard implementation covering &, <, >, ", and '.
 */
export function escapeHtml(s: unknown): string {
  if (typeof s !== "string") {
    return "";
  }
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
