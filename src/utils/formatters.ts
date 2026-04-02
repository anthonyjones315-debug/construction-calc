/**
 * Centralized utility for caching Intl formatter instances.
 * Reusing formatters is significantly more performant than creating new ones,
 * especially in high-frequency loops or animations.
 */

type FormatterOptions = Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key for a given locale and options object.
 */
function getCacheKey(locale: string, options: FormatterOptions = {}): string {
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
 * Gets or creates a cached Intl.NumberFormat instance.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = getCacheKey(locale, options);
  if (!numberFormatCache.has(key)) {
    numberFormatCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return numberFormatCache.get(key)!;
}

/**
 * Gets or creates a cached Intl.DateTimeFormat instance.
 */
export function getDateTimeFormatter(
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options);
  if (!dateTimeFormatCache.has(key)) {
    dateTimeFormatCache.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return dateTimeFormatCache.get(key)!;
}
