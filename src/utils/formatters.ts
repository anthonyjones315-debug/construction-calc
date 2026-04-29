type FormatterOptions = Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key based on locale and options.
 * Sorting options ensures that { style: 'currency', currency: 'USD' } and
 * { currency: 'USD', style: 'currency' } produce the same key.
 */
function getCacheKey(locale: string, options: FormatterOptions): string {
  const keys = Object.keys(options).sort();
  if (keys.length === 0) return locale;

  const optionsString = keys
    .map((key) => `${key}:${options[key as keyof FormatterOptions]}`)
    .join('|');

  return `${locale}|${optionsString}`;
}

/**
 * Retrieves a cached Intl.NumberFormat instance or creates a new one.
 * Caching Intl instances yields up to a ~60x performance improvement over
 * repeated instantiation or using .toLocaleString() in tight loops.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = getCacheKey(locale, options);
  let formatter = numberFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }

  return formatter;
}

/**
 * Retrieves a cached Intl.DateTimeFormat instance or creates a new one.
 */
export function getDateTimeFormatter(
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options);
  let formatter = dateTimeFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }

  return formatter;
}
