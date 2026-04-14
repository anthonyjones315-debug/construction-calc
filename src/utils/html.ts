/**
 * Safely escape strings for use in HTML to prevent XSS.
 * Handles &, <, >, ", and ' characters.
 */
export function escapeHtml(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
