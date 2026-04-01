/**
 * Safely escapes characters that could lead to XSS in HTML contexts.
 * Handles &, <, >, ", and '.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
