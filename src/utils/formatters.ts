type FormatterOptions = Record<string, string | number | boolean | undefined>;

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key for a given locale and options.
 * Sorting the keys ensures that { a: 1, b: 2 } and { b: 2, a: 1 } result in the same key.
 */
function getCacheKey(locale: string, options: FormatterOptions): string {
  const keys = Object.keys(options);
  if (keys.length === 0) return locale;

  const sortedOptions = keys
    .sort()
    .map((key) => `${key}:${options[key]}`)
    .join("|");

  return `${locale}|${sortedOptions}`;
}

/**
 * Returns a cached Intl.NumberFormat instance.
 * Reusing formatters is significantly faster than instantiating them repeatedly,
 * especially in high-frequency loops like requestAnimationFrame.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = getCacheKey(locale, options as FormatterOptions);
  let formatter = numberFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }

  return formatter;
}

/**
 * Returns a cached Intl.DateTimeFormat instance.
 */
export function getDateTimeFormatter(
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options as FormatterOptions);
  let formatter = dateTimeFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }

  return formatter;
}
