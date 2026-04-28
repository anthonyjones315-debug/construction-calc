type FormatterOptions = Intl.NumberFormatOptions;

const numberFormatCache = new Map<string, Intl.NumberFormat>();

function getCacheKey(locale: string, options: FormatterOptions): string {
  const optionKeys = Object.keys(options).sort() as (keyof FormatterOptions)[];
  if (optionKeys.length === 0) return locale;

  const parts = [locale];
  for (const key of optionKeys) {
    parts.push(`${key}:${options[key]}`);
  }
  return parts.join("|");
}

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 * Reusing Intl formatters is significantly faster than creating new ones.
 */
export function getNumberFormatter(
  locale = "en-US",
  options: FormatterOptions = {},
): Intl.NumberFormat {
  const key = getCacheKey(locale, options);
  let formatter = numberFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }

  return formatter;
}
