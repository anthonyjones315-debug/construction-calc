import { describe, it, expect } from 'vitest';
import {
  getNumberFormatter,
  getDateTimeFormatter,
  USD_FORMATTER,
  DATE_FORMATTER_FULL,
  DATE_FORMATTER_WITH_WEEKDAY,
  DATE_FORMATTER_SHORT_DATE
} from './formatters';

describe('formatters', () => {
  describe('getNumberFormatter', () => {
    it('returns a cached formatter for same options', () => {
      const options = { style: 'currency', currency: 'USD' };
      const f1 = getNumberFormatter(options);
      const f2 = getNumberFormatter(options);
      expect(f1).toBe(f2);
    });

    it('returns different formatters for different options', () => {
      const f1 = getNumberFormatter({ style: 'decimal' });
      const f2 = getNumberFormatter({ style: 'percent' });
      expect(f1).not.toBe(f2);
    });
  });

  describe('getDateTimeFormatter', () => {
    it('returns a cached formatter for same options', () => {
      const options = { month: 'short', day: 'numeric' };
      const f1 = getDateTimeFormatter(options);
      const f2 = getDateTimeFormatter(options);
      expect(f1).toBe(f2);
    });
  });

  describe('USD_FORMATTER', () => {
    it('formats USD correctly', () => {
      expect(USD_FORMATTER.format(1234.56)).toBe('$1,234.56');
    });
  });

  describe('DATE_FORMATTER_FULL', () => {
    it('formats date with year correctly', () => {
      const date = new Date('2023-05-20T12:00:00Z');
      // Use toContain to be locale-insensitive for month name if necessary,
      // but "en-US" is default in getNumberFormatter.
      const formatted = DATE_FORMATTER_FULL.format(date);
      expect(formatted).toContain('2023');
      expect(formatted).toContain('May');
      expect(formatted).toContain('20');
    });
  });

  describe('DATE_FORMATTER_WITH_WEEKDAY', () => {
    it('formats date with weekday correctly', () => {
      const date = new Date('2023-05-20T12:00:00Z'); // May 20, 2023 was a Saturday
      const formatted = DATE_FORMATTER_WITH_WEEKDAY.format(date);
      expect(formatted).toContain('Saturday');
      expect(formatted).toContain('May');
      expect(formatted).toContain('20');
    });
  });

  describe('DATE_FORMATTER_SHORT_DATE', () => {
    it('formats short date correctly', () => {
      const date = new Date('2023-05-20T12:00:00Z');
      const formatted = DATE_FORMATTER_SHORT_DATE.format(date);
      expect(formatted).toContain('May');
      expect(formatted).toContain('20');
      expect(formatted).not.toContain('2023');
    });
  });
});
