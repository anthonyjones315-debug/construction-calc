const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getCacheKey(locale: string, options: Record<string, unknown> = {}): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .reduce((acc, key) => {
      acc[key] = options[key];
      return acc;
    }, {} as Record<string, unknown>);
  return `${locale}:${JSON.stringify(sortedOptions)}`;
}

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 * This avoids expensive re-allocation of formatter objects.
 */
export function getNumberFormatter(
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = getCacheKey(locale, options as Record<string, unknown>);
  if (!numberFormatters.has(key)) {
    numberFormatters.set(key, new Intl.NumberFormat(locale, options));
  }
  return numberFormatters.get(key)!;
}

/**
 * Returns a cached Intl.DateTimeFormat instance for the given locale and options.
 * This avoids expensive re-allocation of formatter objects.
 */
export function getDateTimeFormatter(
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options as Record<string, unknown>);
  if (!dateTimeFormatters.has(key)) {
    dateTimeFormatters.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return dateTimeFormatters.get(key)!;
}
