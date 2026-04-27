/**
 * Safely escape HTML special characters to prevent XSS.
 * Optionally converts newlines to <br> tags.
 */
export function escapeHtml(
  value: unknown,
  options?: { nl2br?: boolean }
): string {
  const s = String(value ?? "");
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  if (options?.nl2br) {
    return escaped.replace(/\n/g, "<br>");
  }

  return escaped;
}
