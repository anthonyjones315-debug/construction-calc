/**
 * Centralized caching for Intl formatters to avoid expensive re-instantiation.
 * Repeatedly calling `new Intl.NumberFormat()` or `toLocaleString()` in loops or
 * high-frequency renders can be a significant performance bottleneck.
 */

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key from a locale and options object.
 * BOLT: We use a lightweight check for the most common case (no options)
 * to avoid unnecessary stringification in high-frequency loops.
 */
function getCacheKey(locale: string | string[], options: object = {}): string {
  const localeKey = Array.isArray(locale) ? locale.join(",") : locale;
  if (Object.keys(options).length === 0) return localeKey;

  const sortedOptions = Object.keys(options)
    .sort()
    .reduce((acc, key) => {
      (acc as Record<string, unknown>)[key] = (options as Record<string, unknown>)[key];
      return acc;
    }, {});

  return `${localeKey}:${JSON.stringify(sortedOptions)}`;
}

/**
 * Returns a cached Intl.NumberFormat instance.
 */
export function getNumberFormatter(
  locale: string | string[] = "en-US",
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
 * Returns a cached Intl.DateTimeFormat instance.
 */
export function getDateTimeFormatter(
  locale: string | string[] = "en-US",
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
