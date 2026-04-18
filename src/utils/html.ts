/**
 * Escapes special characters for use in HTML to prevent XSS.
 * Handles &, <, >, ", and '.
 */
export function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const s = String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
