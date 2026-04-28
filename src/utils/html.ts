/**
 * Options for HTML escaping
 */
export interface EscapeOptions {
  /** Convert newlines (\n) to <br> tags */
  nl2br?: boolean;
}

/**
 * Escapes special characters for use in HTML to prevent XSS.
 * Handles &, <, >, ", and '.
 */
export function escapeHtml(value: unknown, options: EscapeOptions = {}): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  let escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  if (options.nl2br) {
    escaped = escaped.replace(/\n/g, "<br />");
  }

  return escaped;
}
