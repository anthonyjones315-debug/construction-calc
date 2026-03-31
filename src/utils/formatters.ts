const numberFormatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Get a cached Intl.NumberFormat instance.
 * Reusing formatters is significantly faster than creating new ones,
 * especially in high-frequency loops like requestAnimationFrame.
 */
export function getNumberFormatter(
  locale: string | string[],
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const cacheKey = JSON.stringify({ locale, options });
  let formatter = numberFormatterCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatterCache.set(cacheKey, formatter);
  }

  return formatter;
}

const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Get a cached Intl.DateTimeFormat instance.
 */
export function getDateTimeFormatter(
  locale: string | string[],
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const cacheKey = JSON.stringify({ locale, options });
  let formatter = dateTimeFormatterCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatterCache.set(cacheKey, formatter);
  }

  return formatter;
}
