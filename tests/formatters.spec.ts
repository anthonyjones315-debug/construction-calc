import { describe, it, expect } from 'vitest';
import { getNumberFormatter, getDateTimeFormatter } from '@/utils/formatters';

describe('formatters', () => {
  it('should return a NumberFormat instance', () => {
    const formatter = getNumberFormatter('en-US');
    expect(formatter).toBeInstanceOf(Intl.NumberFormat);
    expect(formatter.format(1234.56)).toBe('1,234.56');
  });

  it('should return the same instance for same locale and options', () => {
    const formatter1 = getNumberFormatter('en-US', { style: 'currency', currency: 'USD' });
    const formatter2 = getNumberFormatter('en-US', { style: 'currency', currency: 'USD' });
    expect(formatter1).toBe(formatter2);
  });

  it('should return different instances for different options', () => {
    const formatter1 = getNumberFormatter('en-US', { minimumFractionDigits: 1 });
    const formatter2 = getNumberFormatter('en-US', { minimumFractionDigits: 2 });
    expect(formatter1).not.toBe(formatter2);
  });

  it('should return the same instance regardless of option key order', () => {
    const formatter1 = getNumberFormatter('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatter2 = getNumberFormatter('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    expect(formatter1).toBe(formatter2);
  });

  it('should return a DateTimeFormat instance', () => {
    const formatter = getDateTimeFormatter('en-US');
    expect(formatter).toBeInstanceOf(Intl.DateTimeFormat);
  });

  it('should return the same DateTimeFormat instance for same locale and options', () => {
    const formatter1 = getDateTimeFormatter('en-US', { year: 'numeric' });
    const formatter2 = getDateTimeFormatter('en-US', { year: 'numeric' });
    expect(formatter1).toBe(formatter2);
  });
});
