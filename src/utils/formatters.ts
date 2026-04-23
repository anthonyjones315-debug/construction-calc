/**
 * Centralized formatting utilities with instance caching to avoid
 * the heavy overhead of repeatedly instantiating Intl objects.
 */

type FormatterOptions = Record<string, string | number | boolean | undefined>;

/**
 * Generates a deterministic cache key from a locale and an options object.
 * Sorts keys to ensure {a:1, b:2} and {b:2, a:1} result in the same key.
 */
function getCacheKey(locale: string, options?: FormatterOptions): string {
  if (!options || Object.keys(options).length === 0) return locale;

  const sortedOptions = Object.keys(options)
    .sort()
    .map((key) => `${key}:${String(options[key])}`)
    .join("|");

  return `${locale}|${sortedOptions}`;
}

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 */
export function getNumberFormatter(
  locale: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = getCacheKey(locale, options as FormatterOptions);
  let formatter = numberFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }

  return formatter;
}

/**
 * Returns a cached Intl.DateTimeFormat instance for the given locale and options.
 */
export function getDateTimeFormatter(
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options as FormatterOptions);
  let formatter = dateTimeFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }

  return formatter;
}
