type FormatterOptions = Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key for a given locale and options.
 */
function getCacheKey(locale: string, options?: FormatterOptions): string {
  if (!options) return locale;

  // Sort keys to ensure deterministic key generation regardless of property order
  const sortedKeys = Object.keys(options).sort();
  const optionsKey = sortedKeys
    .map((key) => `${key}:${options[key as keyof FormatterOptions]}`)
    .join("|");

  return `${locale}|${optionsKey}`;
}

/**
 * Returns a cached Intl.NumberFormat instance or creates a new one.
 * Using a cached instance is significantly faster than repeated instantiation,
 * especially in high-frequency loops or document generation.
 */
export function getNumberFormatter(
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions,
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
 * Returns a cached Intl.DateTimeFormat instance or creates a new one.
 */
export function getDateTimeFormatter(
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options);
  let formatter = dateTimeFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }

  return formatter;
}
