const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key for a given locale and options object.
 * Keys are sorted alphabetically to ensure consistent hits regardless of property order.
 */
function getCacheKey(locale: string, options: object): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = (options as Record<string, unknown>)[key];
        return acc;
      },
      {} as Record<string, unknown>,
    );
  return `${locale}:${JSON.stringify(sortedOptions)}`;
}

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 * Performance optimization to avoid repeated object allocation.
 */
export function getNumberFormatter(
  locale: string = "en-US",
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
 * Returns a cached Intl.DateTimeFormat instance for the given locale and options.
 * Performance optimization to avoid repeated object allocation.
 */
export function getDateTimeFormatter(
  locale: string = "en-US",
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
