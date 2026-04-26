type FormatterOptions = Intl.NumberFormatOptions;

const numberFormatters = new Map<string, Intl.NumberFormat>();

function getCacheKey(locale: string, options: FormatterOptions): string {
  const keys = Object.keys(options).sort();
  if (keys.length === 0) return locale;

  const optionsString = keys
    .map((key) => {
      const val = options[key as keyof FormatterOptions];
      return `${key}:${val}`;
    })
    .join("|");
  return `${locale}|${optionsString}`;
}

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 * This avoids the high overhead of repeatedly instantiating Intl formatters.
 */
export function getNumberFormatter(
  locale: string = "en-US",
  options: FormatterOptions = {}
): Intl.NumberFormat {
  const cacheKey = getCacheKey(locale, options);
  let formatter = numberFormatters.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(cacheKey, formatter);
  }

  return formatter;
}

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns a cached Intl.DateTimeFormat instance for the given locale and options.
 */
export function getDateTimeFormatter(
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {}
): Intl.DateTimeFormat {
  const keys = Object.keys(options).sort();
  const optionsString = keys
    .map((key) => {
      const val = options[key as keyof Intl.DateTimeFormatOptions];
      return `${key}:${val}`;
    })
    .join("|");
  const cacheKey = `${locale}|${optionsString}`;

  let formatter = dateTimeFormatters.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(cacheKey, formatter);
  }

  return formatter;
}
