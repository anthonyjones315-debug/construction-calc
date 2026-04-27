type FormatterOptions = Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

function getCacheKey(locale: string, options: FormatterOptions): string {
  const optionKeys = Object.keys(options).sort();
  if (optionKeys.length === 0) return locale;

  const parts = [locale];
  for (const key of optionKeys) {
    parts.push(`${key}:${options[key as keyof FormatterOptions]}`);
  }
  return parts.join("|");
}

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 * Repeatedly instantiating Intl.NumberFormat is expensive (up to 70x slower than caching).
 */
export function getNumberFormatter(
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = {},
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
 * Returns a cached Intl.DateTimeFormat instance for the given locale and options.
 */
export function getDateTimeFormatter(
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options);
  let formatter = dateTimeFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }

  return formatter;
}
