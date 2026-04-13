const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key for Intl options.
 */
function getCacheKey(locale: string, options: Record<string, unknown> = {}): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .reduce((acc, key) => {
      acc[key] = options[key];
      return acc;
    }, {} as Record<string, unknown>);

  return `${locale}:${JSON.stringify(sortedOptions)}`;
}

/**
 * Returns a cached Intl.NumberFormat instance.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = getCacheKey(locale, options as Record<string, unknown>);
  let formatter = numberFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
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
  const key = getCacheKey(locale, options as Record<string, unknown>);
  let formatter = dateTimeFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }

  return formatter;
}
