type NumberFormatOptions = Intl.NumberFormatOptions;
type DateTimeFormatOptions = Intl.DateTimeFormatOptions;

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getCacheKey(
  locale: string,
  options: Record<string, string | number | boolean | undefined> = {},
): string {
  const keys = Object.keys(options).sort();
  if (keys.length === 0) return locale;

  const optionsKey = keys
    .map((key) => `${key}:${options[key]}`)
    .join('|');
  return `${locale}|${optionsKey}`;
}

/**
 * Returns a cached Intl.NumberFormat instance.
 * Reusing formatters is significantly faster than creating new ones.
 */
export function getNumberFormatter(
  locale: string = 'en-US',
  options: NumberFormatOptions = {}
): Intl.NumberFormat {
  const key = getCacheKey(locale, options);
  let formatter = numberFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }

  return formatter;
}

/**
 * Returns a cached Intl.DateTimeFormat instance.
 * Reusing formatters is significantly faster than creating new ones.
 */
export function getDateTimeFormatter(
  locale: string = 'en-US',
  options: DateTimeFormatOptions = {}
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options);
  let formatter = dateTimeFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }

  return formatter;
}
