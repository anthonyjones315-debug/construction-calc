/**
 * Centralized utility for caching Intl formatter instances.
 * Repeatedly instantiating Intl.NumberFormat and Intl.DateTimeFormat can be expensive,
 * especially in loops or high-frequency updates (like animations).
 */

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 */
export function getNumberFormatter(
  locale: string | string[] = "en-US",
  options: Intl.NumberFormatOptions = {}
): Intl.NumberFormat {
  const key = `${locale}-${Object.keys(options)
    .sort()
    .map((k) => `${k}:${(options as Record<string, unknown>)[k]}`)
    .join("|")}`;

  let formatter = numberFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }

  return formatter;
}

/**
 * Returns a cached Intl.DateTimeFormat instance for the given locale and options.
 */
export function getDateTimeFormatter(
  locale: string | string[] = "en-US",
  options: Intl.DateTimeFormatOptions = {}
): Intl.DateTimeFormat {
  const key = `${locale}-${Object.keys(options)
    .sort()
    .map((k) => `${k}:${(options as Record<string, unknown>)[k]}`)
    .join("|")}`;

  let formatter = dateTimeFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }

  return formatter;
}
