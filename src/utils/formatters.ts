type FormatterOptions = Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Generates a deterministic cache key for a given locale and options object.
 */
function getCacheKey(locale: string, options: FormatterOptions): string {
  const keys = Object.keys(options);

  // Fast-path: if no options, just use the locale
  if (keys.length === 0) return locale;

  // Sort keys to ensure deterministic key generation
  keys.sort();

  const optionsString = keys
    .map((key) => `${key}:${String(options[key as keyof FormatterOptions])}`)
    .join("|");

  return `${locale}|${optionsString}`;
}

/**
 * Returns a cached Intl.NumberFormat instance for the given options and locale.
 */
export function getNumberFormatter(
  options: Intl.NumberFormatOptions = {},
  locale: string = "en-US",
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
 * Optimized pre-instantiated USD currency formatter.
 * Use this for high-performance rendering of currency values.
 */
export const USD_FORMATTER = getNumberFormatter({
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Optimized pre-instantiated full date formatter (e.g., "Oct 12, 2023").
 */
export const DATE_FORMATTER_FULL = getDateTimeFormatter({
  month: "short",
  day: "numeric",
  year: "numeric",
});

/**
 * Optimized pre-instantiated today's date formatter (e.g., "Thursday, Oct 12").
 */
export const DATE_FORMATTER_TODAY = getDateTimeFormatter({
  weekday: "long",
  month: "short",
  day: "numeric",
});

/**
 * Returns a cached Intl.DateTimeFormat instance for the given options and locale.
 */
export function getDateTimeFormatter(
  options: Intl.DateTimeFormatOptions = {},
  locale: string = "en-US",
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options);
  let formatter = dateTimeFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }

  return formatter;
}
