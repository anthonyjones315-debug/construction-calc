const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns a cached Intl.NumberFormat instance for the given locale and options.
 * Reusing formatters is significantly faster than creating new ones, especially
 * in high-frequency paths like animation loops.
 */
export function getNumberFormatter(
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const sortedOptions: Record<string, unknown> = {};
  const keys = Object.keys(options).sort();
  for (const k of keys) {
    sortedOptions[k] = (options as Record<string, unknown>)[k];
  }
  const key = `${locale}:${JSON.stringify(sortedOptions)}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
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
  const sortedOptions: Record<string, unknown> = {};
  const keys = Object.keys(options).sort();
  for (const k of keys) {
    sortedOptions[k] = (options as Record<string, unknown>)[k];
  }
  const key = `${locale}:${JSON.stringify(sortedOptions)}`;
  let formatter = dateTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }
  return formatter;
}
