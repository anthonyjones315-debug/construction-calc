type FormatterOptions = Intl.NumberFormatOptions;

const numberFormatterCache = new Map<string, Intl.NumberFormat>();

function getCacheKey(locale: string, options: FormatterOptions): string {
  const entries = Object.entries(options).sort(([a], [b]) => a.localeCompare(b));
  return `${locale}:${JSON.stringify(entries)}`;
}

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 * Reusing formatters is significantly faster than creating new ones.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: FormatterOptions = {},
): Intl.NumberFormat {
  const key = getCacheKey(locale, options);
  let formatter = numberFormatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatterCache.set(key, formatter);
  }

  return formatter;
}
