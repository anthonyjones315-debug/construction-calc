/**
 * Securely escapes characters for use in HTML to prevent XSS.
 * Includes escaping for &, <, >, ", and '.
 */
export function escapeHtml(str: string): string {
  const entityMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (s) => entityMap[s] || s);
}
