/**
 * Centralized formatter utility to reuse Intl instances.
 * Reusing Intl formatters can be 10-100x faster than repeated instantiation.
 */

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key from options by sorting keys.
 */
function getCacheKey(options: Record<string, unknown>): string {
  return JSON.stringify(
    Object.keys(options)
      .sort()
      .reduce((acc, key) => {
        acc[key] = options[key];
        return acc;
      }, {} as Record<string, unknown>),
  );
}

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = `${locale}:${getCacheKey(options as Record<string, unknown>)}`;
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
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = `${locale}:${getCacheKey(options as Record<string, unknown>)}`;
  let formatter = dateTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }
  return formatter;
}
