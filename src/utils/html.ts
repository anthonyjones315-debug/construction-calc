/**
 * Safely escape HTML special characters to prevent XSS.
 * Handles unknown values by converting them to strings.
 * Returns an empty string for null or undefined.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const s = String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
