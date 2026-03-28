/**
 * Safely escape HTML special characters in a string.
 * This helps prevent XSS when interpolating user-controlled strings into HTML templates.
 */
export function escapeHtml(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
