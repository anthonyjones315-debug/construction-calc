/**
 * Securely escapes HTML special characters in a string to prevent XSS.
 * Handles &, <, >, ", and ' characters.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) {
    return "";
  }

  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
