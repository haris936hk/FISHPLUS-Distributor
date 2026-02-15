import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validatePhone,
  validateNIC,
  validateEmail,
  validateDateRange,
  validatePositiveNumber,
} from '../src/renderer/utils/validators';

describe('Validators Utility', () => {
  describe('validateRequired', () => {
    it('should pass for non-empty values', () => {
      expect(validateRequired('hello').isValid).toBe(true);
      expect(validateRequired(123).isValid).toBe(true);
    });

    it('should fail for null and undefined', () => {
      expect(validateRequired(null).isValid).toBe(false);
      expect(validateRequired(undefined).isValid).toBe(false);
    });

    it('should fail for empty string', () => {
      expect(validateRequired('').isValid).toBe(false);
    });

    it('should fail for whitespace-only string', () => {
      expect(validateRequired('   ').isValid).toBe(false);
    });

    it('should include field name in error', () => {
      const result = validateRequired('', 'Name');
      expect(result.error).toBe('Name is required');
    });
  });

  describe('validatePhone', () => {
    it('should pass for valid Pakistani mobile', () => {
      expect(validatePhone('03001234567').isValid).toBe(true);
    });

    it('should pass for +92 format', () => {
      expect(validatePhone('923001234567').isValid).toBe(true);
    });

    it('should pass for 10-digit format', () => {
      expect(validatePhone('3001234567').isValid).toBe(true);
    });

    it('should pass for empty when not required', () => {
      expect(validatePhone('').isValid).toBe(true);
      expect(validatePhone(null).isValid).toBe(true);
    });

    it('should fail for empty when required', () => {
      expect(validatePhone('', true).isValid).toBe(false);
    });

    it('should fail for invalid format', () => {
      expect(validatePhone('12345').isValid).toBe(false);
    });
  });

  describe('validateNIC', () => {
    it('should pass for valid 13-digit NIC', () => {
      expect(validateNIC('1234512345671').isValid).toBe(true);
    });

    it('should pass for NIC with dashes', () => {
      expect(validateNIC('12345-1234567-1').isValid).toBe(true);
    });

    it('should pass for empty when not required', () => {
      expect(validateNIC('').isValid).toBe(true);
    });

    it('should fail for empty when required', () => {
      expect(validateNIC('', true).isValid).toBe(false);
    });

    it('should fail for invalid length', () => {
      expect(validateNIC('12345').isValid).toBe(false);
      expect(validateNIC('12345678901234').isValid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should pass for valid email', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
      expect(validateEmail('user.name@domain.co.uk').isValid).toBe(true);
    });

    it('should pass for empty when not required', () => {
      expect(validateEmail('').isValid).toBe(true);
    });

    it('should fail for empty when required', () => {
      expect(validateEmail('', true).isValid).toBe(false);
    });

    it('should fail for invalid email', () => {
      expect(validateEmail('notanemail').isValid).toBe(false);
      expect(validateEmail('missing@domain').isValid).toBe(false);
      expect(validateEmail('@nodomain.com').isValid).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('should pass for valid date range', () => {
      expect(validateDateRange('2026-01-01', '2026-12-31').isValid).toBe(true);
    });

    it('should pass for same dates', () => {
      expect(validateDateRange('2026-02-06', '2026-02-06').isValid).toBe(true);
    });

    it('should pass when dates are empty', () => {
      expect(validateDateRange(null, null).isValid).toBe(true);
    });

    it('should fail when from > to', () => {
      expect(validateDateRange('2026-12-31', '2026-01-01').isValid).toBe(false);
    });
  });

  describe('validatePositiveNumber', () => {
    it('should pass for positive numbers', () => {
      expect(validatePositiveNumber(100).isValid).toBe(true);
      expect(validatePositiveNumber(0.5).isValid).toBe(true);
    });

    it('should pass for zero when allowed', () => {
      expect(validatePositiveNumber(0).isValid).toBe(true);
    });

    it('should fail for zero when not allowed', () => {
      expect(validatePositiveNumber(0, 'Amount', false).isValid).toBe(false);
    });

    it('should fail for negative numbers', () => {
      expect(validatePositiveNumber(-10).isValid).toBe(false);
    });

    it('should fail for non-numeric values', () => {
      expect(validatePositiveNumber('abc').isValid).toBe(false);
    });
  });
});
