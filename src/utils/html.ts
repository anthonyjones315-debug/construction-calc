/**
 * Centralized HTML sanitization utilities to prevent XSS.
 */

/**
 * Escapes special HTML characters in a string.
 */
export function escapeHtml(s: string | null | undefined): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escapes HTML and converts newlines to <br> tags.
 * Useful for multi-line text blocks in HTML emails or PDFs.
 */
export function nl2br(text: string | null | undefined): string {
  if (!text) return "";
  return escapeHtml(text).replace(/\n/g, "<br />");
}
