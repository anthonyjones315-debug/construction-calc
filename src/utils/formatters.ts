/**
 * Centralized caching for Intl formatters to avoid expensive re-instantiation.
 * Especially useful in high-frequency loops or large document generation.
 */

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

function getCacheKey(locale: string | string[] | undefined, options: Record<string, unknown> = {}): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .map((key) => `${key}:${String(options[key])}`)
    .join("|");
  return `${Array.isArray(locale) ? locale.join(",") : (locale ?? "default")}-${sortedOptions}`;
}

/**
 * Returns a cached Intl.NumberFormat instance.
 */
export function getNumberFormatter(
  locale?: string | string[],
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = getCacheKey(locale, options as Record<string, unknown>);
  let formatter = numberFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }

  return formatter;
}

/**
 * Returns a cached Intl.DateTimeFormat instance.
 */
export function getDateTimeFormatter(
  locale?: string | string[],
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = getCacheKey(locale, options as Record<string, unknown>);
  let formatter = dateTimeFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }

  return formatter;
}
