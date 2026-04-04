const numberFormatterCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getCacheKey(locale: string, options: Record<string, unknown> = {}): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .reduce((acc, key) => {
      acc[key] = options[key];
      return acc;
    }, {} as Record<string, unknown>);
  return `${locale}-${JSON.stringify(sortedOptions)}`;
}

/**
 * Gets a cached Intl.NumberFormat instance for the given locale and options.
 * This prevents expensive re-allocation of formatter objects in high-frequency loops.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = getCacheKey(locale, options as Record<string, unknown>);
  if (!numberFormatterCache.has(key)) {
    numberFormatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return numberFormatterCache.get(key)!;
}

/**
 * Gets a cached Intl.DateTimeFormat instance for the given locale and options.
 */
export function getDateTimeFormatter(
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options as Record<string, unknown>);
  if (!dateTimeFormatterCache.has(key)) {
    dateTimeFormatterCache.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return dateTimeFormatterCache.get(key)!;
}
