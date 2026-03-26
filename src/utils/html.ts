/**
 * Escapes characters with special meaning in HTML to prevent XSS.
 * This should be used for all user-controlled strings before they are
 * interpolated into an HTML context.
 *
 * It handles the following characters:
 * & -> &amp;
 * < -> &lt;
 * > -> &gt;
 * " -> &quot;
 * ' -> &#39;
 *
 * @param value The string to escape.
 * @returns The escaped string.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const s = String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
