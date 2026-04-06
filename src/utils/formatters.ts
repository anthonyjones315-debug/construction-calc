type FormatterOptions = Record<string, unknown>;

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key for Intl formatters by sorting option keys.
 */
function getCacheKey(locale: string, options: FormatterOptions): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .reduce((acc, key) => {
      acc[key] = options[key];
      return acc;
    }, {} as FormatterOptions);
  return `${locale}-${JSON.stringify(sortedOptions)}`;
}

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 * This improves performance by avoiding expensive re-allocation of formatter objects.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
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
 * This improves performance by avoiding expensive re-allocation of formatter objects.
 */
export function getDateTimeFormatter(
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options as FormatterOptions);
  let formatter = dateTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }
  return formatter;
}
