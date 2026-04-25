/**
 * Minimal HTML escaping utility for preventing XSS.
 */
export function escapeHtml(s: string, options: { nl2br?: boolean } = {}): string {
  if (typeof s !== "string") return String(s);
  let escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  if (options.nl2br) {
    escaped = escaped.replace(/\n/g, "<br>");
  }

  return escaped;
}
