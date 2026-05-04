/**
 * Safely escape HTML special characters in a string.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escapes HTML and then converts newlines to <br /> tags.
 */
export function nl2br(text: string): string {
  return escapeHtml(text).replace(/\r?\n/g, "<br />");
}
