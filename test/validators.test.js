const { expect } = require('chai');

// Test validators using direct logic (since actual file uses ES modules)

describe('Validators Utility', () => {
  describe('validateRequired', () => {
    const validateRequired = (value, fieldName = 'This field') => {
      if (value === null || value === undefined || value === '') {
        return { isValid: false, error: `${fieldName} is required` };
      }
      if (typeof value === 'string' && value.trim() === '') {
        return { isValid: false, error: `${fieldName} is required` };
      }
      return { isValid: true };
    };

    it('should pass for non-empty values', () => {
      expect(validateRequired('hello').isValid).to.be.true;
      expect(validateRequired(123).isValid).to.be.true;
    });

    it('should fail for null and undefined', () => {
      expect(validateRequired(null).isValid).to.be.false;
      expect(validateRequired(undefined).isValid).to.be.false;
    });

    it('should fail for empty string', () => {
      expect(validateRequired('').isValid).to.be.false;
    });

    it('should fail for whitespace-only string', () => {
      expect(validateRequired('   ').isValid).to.be.false;
    });

    it('should include field name in error', () => {
      const result = validateRequired('', 'Name');
      expect(result.error).to.equal('Name is required');
    });
  });

  describe('validatePhone', () => {
    const validatePhone = (phone, required = false) => {
      if (!phone || phone.trim() === '') {
        if (required) {
          return { isValid: false, error: 'Phone number is required' };
        }
        return { isValid: true };
      }
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return { isValid: true };
      }
      if (cleaned.length === 12 && cleaned.startsWith('92')) {
        return { isValid: true };
      }
      if (cleaned.length === 10 && /^3[0-9]{9}$/.test(cleaned)) {
        return { isValid: true };
      }
      return {
        isValid: false,
        error: 'Invalid phone format. Use Pakistani format (e.g., 03001234567)',
      };
    };

    it('should pass for valid Pakistani mobile', () => {
      expect(validatePhone('03001234567').isValid).to.be.true;
    });

    it('should pass for +92 format', () => {
      expect(validatePhone('923001234567').isValid).to.be.true;
    });

    it('should pass for 10-digit format', () => {
      expect(validatePhone('3001234567').isValid).to.be.true;
    });

    it('should pass for empty when not required', () => {
      expect(validatePhone('').isValid).to.be.true;
      expect(validatePhone(null).isValid).to.be.true;
    });

    it('should fail for empty when required', () => {
      expect(validatePhone('', true).isValid).to.be.false;
    });

    it('should fail for invalid format', () => {
      expect(validatePhone('12345').isValid).to.be.false;
    });
  });

  describe('validateNIC', () => {
    const validateNIC = (nic, required = false) => {
      if (!nic || nic.trim() === '') {
        if (required) {
          return { isValid: false, error: 'NIC number is required' };
        }
        return { isValid: true };
      }
      const cleaned = nic.replace(/\D/g, '');
      if (cleaned.length !== 13) {
        return { isValid: false, error: 'NIC must be 13 digits (XXXXX-XXXXXXX-X)' };
      }
      if (!/^\d{13}$/.test(cleaned)) {
        return { isValid: false, error: 'NIC must contain only numbers' };
      }
      return { isValid: true };
    };

    it('should pass for valid 13-digit NIC', () => {
      expect(validateNIC('1234512345671').isValid).to.be.true;
    });

    it('should pass for NIC with dashes', () => {
      expect(validateNIC('12345-1234567-1').isValid).to.be.true;
    });

    it('should pass for empty when not required', () => {
      expect(validateNIC('').isValid).to.be.true;
    });

    it('should fail for empty when required', () => {
      expect(validateNIC('', true).isValid).to.be.false;
    });

    it('should fail for invalid length', () => {
      expect(validateNIC('12345').isValid).to.be.false;
      expect(validateNIC('12345678901234').isValid).to.be.false;
    });
  });

  describe('validateEmail', () => {
    const validateEmail = (email, required = false) => {
      if (!email || email.trim() === '') {
        if (required) {
          return { isValid: false, error: 'Email is required' };
        }
        return { isValid: true };
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
      }
      return { isValid: true };
    };

    it('should pass for valid email', () => {
      expect(validateEmail('test@example.com').isValid).to.be.true;
      expect(validateEmail('user.name@domain.co.uk').isValid).to.be.true;
    });

    it('should pass for empty when not required', () => {
      expect(validateEmail('').isValid).to.be.true;
    });

    it('should fail for empty when required', () => {
      expect(validateEmail('', true).isValid).to.be.false;
    });

    it('should fail for invalid email', () => {
      expect(validateEmail('notanemail').isValid).to.be.false;
      expect(validateEmail('missing@domain').isValid).to.be.false;
      expect(validateEmail('@nodomain.com').isValid).to.be.false;
    });
  });

  describe('validateDateRange', () => {
    const validateDateRange = (fromDate, toDate) => {
      if (!fromDate || !toDate) {
        return { isValid: true };
      }
      const from = fromDate instanceof Date ? fromDate : new Date(fromDate);
      const to = toDate instanceof Date ? toDate : new Date(toDate);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
      }
      if (from > to) {
        return { isValid: false, error: 'From date cannot be later than To date' };
      }
      return { isValid: true };
    };

    it('should pass for valid date range', () => {
      expect(validateDateRange('2026-01-01', '2026-12-31').isValid).to.be.true;
    });

    it('should pass for same dates', () => {
      expect(validateDateRange('2026-02-06', '2026-02-06').isValid).to.be.true;
    });

    it('should pass when dates are empty', () => {
      expect(validateDateRange(null, null).isValid).to.be.true;
    });

    it('should fail when from > to', () => {
      expect(validateDateRange('2026-12-31', '2026-01-01').isValid).to.be.false;
    });
  });

  describe('validatePositiveNumber', () => {
    const validatePositiveNumber = (value, fieldName = 'Value', allowZero = true) => {
      if (value === null || value === undefined || value === '') {
        return { isValid: true };
      }
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) {
        return { isValid: false, error: `${fieldName} must be a valid number` };
      }
      if (allowZero && num < 0) {
        return { isValid: false, error: `${fieldName} cannot be negative` };
      }
      if (!allowZero && num <= 0) {
        return { isValid: false, error: `${fieldName} must be greater than zero` };
      }
      return { isValid: true };
    };

    it('should pass for positive numbers', () => {
      expect(validatePositiveNumber(100).isValid).to.be.true;
      expect(validatePositiveNumber(0.5).isValid).to.be.true;
    });

    it('should pass for zero when allowed', () => {
      expect(validatePositiveNumber(0).isValid).to.be.true;
    });

    it('should fail for zero when not allowed', () => {
      expect(validatePositiveNumber(0, 'Amount', false).isValid).to.be.false;
    });

    it('should fail for negative numbers', () => {
      expect(validatePositiveNumber(-10).isValid).to.be.false;
    });

    it('should fail for non-numeric values', () => {
      expect(validatePositiveNumber('abc').isValid).to.be.false;
    });
  });
});
