/**
 * Centralized utility for HTML escaping to prevent XSS.
 */

interface EscapeOptions {
  nl2br?: boolean;
}

/**
 * Escapes characters with special meaning in HTML to prevent XSS.
 * Replaces &, <, >, ", and ' with their corresponding HTML entities.
 *
 * @param s The string to escape (will be cast to string if not)
 * @param options.nl2br If true, also replaces newlines with <br> tags.
 */
export function escapeHtml(s: unknown, options: EscapeOptions = {}): string {
  const str = String(s ?? "");
  const escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  if (options.nl2br) {
    return escaped.replace(/\n/g, "<br>");
  }

  return escaped;
}
