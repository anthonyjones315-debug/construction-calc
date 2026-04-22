
type FormatterOptions = Record<string, string | number | boolean | undefined>;

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Generate a deterministic cache key for Intl formatters.
 */
function getCacheKey(locale: string, options: FormatterOptions = {}): string {
  const optionKeys = Object.keys(options).sort();
  if (optionKeys.length === 0) return locale;

  const parts = optionKeys.map(key => `${key}:${options[key]}`);
  return `${locale}|${parts.join('|')}`;
}

/**
 * Get a cached Intl.NumberFormat instance.
 * Reusing formatters is ~50-100x faster than creating new ones.
 */
export function getNumberFormatter(
  locale: string,
  options?: Intl.NumberFormatOptions
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
 * Get a cached Intl.DateTimeFormat instance.
 */
export function getDateTimeFormatter(
  locale: string,
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options as FormatterOptions);
  let formatter = dateTimeFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }

  return formatter;
}
