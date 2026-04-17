/**
 * Centralized caching for Intl formatters to prevent expensive re-instantiation.
 * Instantiating Intl.NumberFormat can be 100x slower than reusing an existing instance.
 */

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Gets a cached Intl.NumberFormat instance or creates one if it doesn't exist.
 */
export function getNumberFormatter(
  locale: string,
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const optionsKey = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k as keyof Intl.NumberFormatOptions]}`)
    .join(",");
  const key = `${locale}|${optionsKey}`;

  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Gets a cached Intl.DateTimeFormat instance or creates one if it doesn't exist.
 */
export function getDateTimeFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const optionsKey = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k as keyof Intl.DateTimeFormatOptions]}`)
    .join(",");
  const key = `${locale}|${optionsKey}`;

  let formatter = dateTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }
  return formatter;
}
