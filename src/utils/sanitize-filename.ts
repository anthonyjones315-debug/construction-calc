const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001F]+/g;
const WHITESPACE_RUN = /\s+/g;
const DASH_RUN = /-+/g;
const LEADING_OR_TRAILING_DOTS_AND_DASHES = /^[.-]+|[.-]+$/g;

export function sanitizeFilename(value: string, fallback = "export"): string {
  const sanitized = value
    .normalize("NFKC")
    .replace(INVALID_FILENAME_CHARS, "-")
    .replace(WHITESPACE_RUN, "-")
    .replace(DASH_RUN, "-")
    .replace(LEADING_OR_TRAILING_DOTS_AND_DASHES, "")
    .toLowerCase();

  return sanitized || fallback;
}
