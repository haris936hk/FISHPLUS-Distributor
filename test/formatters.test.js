import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatWeight,
  formatDate,
  formatNIC,
  formatPhone,
} from '../src/renderer/utils/formatters';

describe('Formatters Utility', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts with symbol', () => {
      expect(formatCurrency(1234.56)).toBe('Rs. 1,234.56');
    });

    it('should format large amounts with thousand separators', () => {
      expect(formatCurrency(84583242.29)).toBe('Rs. 84,583,242.29');
    });

    it('should handle zero amounts', () => {
      expect(formatCurrency(0)).toBe('Rs. 0.00');
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('Rs. 0.00');
      expect(formatCurrency(undefined)).toBe('Rs. 0.00');
    });

    it('should handle string amounts', () => {
      expect(formatCurrency('1234.56')).toBe('Rs. 1,234.56');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-500)).toBe('Rs. -500.00');
    });

    it('should format without symbol when specified', () => {
      expect(formatCurrency(1234.56, { showSymbol: false })).toBe('1,234.56');
    });

    it('should handle NaN', () => {
      expect(formatCurrency(NaN)).toBe('Rs. 0.00');
    });

    it('should handle Infinity', () => {
      // Depending on implementation, might return Infinity or something else.
      // Standard toLocaleString handles Infinity.
      // But our implementation checks isNaN. Infinity is not NaN.
      // Let's see what happens.
      // Actually `toLocaleString` on Infinity returns "∞"
      expect(formatCurrency(Infinity)).toContain('∞');
    });
  });

  describe('formatWeight', () => {
    it('should format weight with kg unit', () => {
      expect(formatWeight(25.5)).toBe('25.500 kg');
    });

    it('should handle integer weights', () => {
      expect(formatWeight(100)).toBe('100.000 kg');
    });

    it('should handle null and undefined', () => {
      expect(formatWeight(null)).toBe('0.000 kg');
      expect(formatWeight(undefined)).toBe('0.000 kg');
    });

    it('should format without unit when specified', () => {
      expect(formatWeight(25.5, { showUnit: false })).toBe('25.500');
    });

    it('should handle NaN', () => {
      expect(formatWeight(NaN)).toBe('0.000 kg');
    });
  });

  describe('formatDate', () => {
    it('should format date as DD-MM-YYYY', () => {
      const date = new Date('2026-02-06T00:00:00');
      expect(formatDate(date)).toBe('06-02-2026');
    });

    it('should format date as DD/Mon/YYYY', () => {
      const date = new Date('2026-02-06T00:00:00');
      expect(formatDate(date, 'DD/Mon/YYYY')).toBe('06/Feb/2026');
    });

    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2026-02-06T00:00:00');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-02-06');
    });

    it('should handle empty values', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('should handle invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('formatNIC', () => {
    it('should format 13-digit NIC with dashes', () => {
      expect(formatNIC('1234512345671')).toBe('12345-1234567-1');
    });

    it('should handle already formatted NIC', () => {
      expect(formatNIC('12345-1234567-1')).toBe('12345-1234567-1');
    });

    it('should handle empty values', () => {
      expect(formatNIC(null)).toBe('');
      expect(formatNIC('')).toBe('');
    });
  });

  describe('formatPhone', () => {
    it('should handle 11-digit Pakistani mobile', () => {
      expect(formatPhone('03001234567')).toBe('03001234567');
    });

    it('should add leading zero to 10-digit number', () => {
      expect(formatPhone('3001234567')).toBe('03001234567');
    });

    it('should convert +92 format to local', () => {
      expect(formatPhone('923001234567')).toBe('03001234567');
    });

    it('should handle empty values', () => {
      expect(formatPhone(null)).toBe('');
      expect(formatPhone('')).toBe('');
    });
  });
});
