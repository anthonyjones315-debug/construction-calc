type FormatterOptions = Record<string, string | number | boolean | undefined>;

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getCacheKey(locale: string, options: FormatterOptions): string {
  const keys = Object.keys(options).sort();
  if (keys.length === 0) return locale;

  const parts = [locale];
  for (const key of keys) {
    const val = options[key];
    if (val !== undefined) {
      parts.push(`${key}:${val}`);
    }
  }
  return parts.join("|");
}

/**
 * Gets a cached Intl.NumberFormat instance for the given locale and options.
 * This avoids the overhead of repeated instantiation, which can be significant
 * in high-frequency loops or document generation.
 */
export function getNumberFormatter(
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const cacheKey = getCacheKey(locale, options as FormatterOptions);
  let formatter = numberFormatters.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(cacheKey, formatter);
  }

  return formatter;
}

/**
 * Gets a cached Intl.DateTimeFormat instance for the given locale and options.
 */
export function getDateTimeFormatter(
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const cacheKey = getCacheKey(locale, options as FormatterOptions);
  let formatter = dateTimeFormatters.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(cacheKey, formatter);
  }

  return formatter;
}
