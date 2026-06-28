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
 * Pre-instantiated USD currency formatter with 2 decimal places.
 */
export const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Pre-instantiated USD currency formatter with 0 decimal places.
 */
export const USD_FORMATTER_NO_DECIMALS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Pre-instantiated date formatter (e.g., "Monday, Jan 1").
 */
export const DATE_FORMATTER_FULL = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

/**
 * Pre-instantiated short date formatter (e.g., "Jan 1").
 */
export const DATE_FORMATTER_SHORT_DATE = new Intl.DateTimeFormat("en-US", {
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
