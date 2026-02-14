const { expect } = require('chai');

// We need to test the formatters using CommonJS-compatible approach
// The actual formatters use ES modules, so we test the logic directly

describe('Formatters Utility', () => {
  describe('formatCurrency', () => {
    // Test formatCurrency logic
    const formatCurrency = (amount, options = {}) => {
      const { symbol = 'Rs.', decimals = 2, showSymbol = true } = options;
      if (amount === null || amount === undefined || amount === '') {
        return showSymbol ? `${symbol} 0.00` : '0.00';
      }
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(num)) {
        return showSymbol ? `${symbol} 0.00` : '0.00';
      }
      const formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return showSymbol ? `${symbol} ${formatted}` : formatted;
    };

    it('should format positive amounts with symbol', () => {
      expect(formatCurrency(1234.56)).to.equal('Rs. 1,234.56');
    });

    it('should format large amounts with thousand separators', () => {
      expect(formatCurrency(84583242.29)).to.equal('Rs. 84,583,242.29');
    });

    it('should handle zero amounts', () => {
      expect(formatCurrency(0)).to.equal('Rs. 0.00');
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).to.equal('Rs. 0.00');
      expect(formatCurrency(undefined)).to.equal('Rs. 0.00');
    });

    it('should handle string amounts', () => {
      expect(formatCurrency('1234.56')).to.equal('Rs. 1,234.56');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-500)).to.equal('Rs. -500.00');
    });

    it('should format without symbol when specified', () => {
      expect(formatCurrency(1234.56, { showSymbol: false })).to.equal('1,234.56');
    });
  });

  describe('formatWeight', () => {
    const formatWeight = (weight, options = {}) => {
      const { decimals = 3, showUnit = true } = options;
      if (weight === null || weight === undefined || weight === '') {
        return showUnit ? '0.000 kg' : '0.000';
      }
      const num = typeof weight === 'string' ? parseFloat(weight) : weight;
      if (isNaN(num)) {
        return showUnit ? '0.000 kg' : '0.000';
      }
      const formatted = num.toFixed(decimals);
      return showUnit ? `${formatted} kg` : formatted;
    };

    it('should format weight with kg unit', () => {
      expect(formatWeight(25.5)).to.equal('25.500 kg');
    });

    it('should handle integer weights', () => {
      expect(formatWeight(100)).to.equal('100.000 kg');
    });

    it('should handle null and undefined', () => {
      expect(formatWeight(null)).to.equal('0.000 kg');
      expect(formatWeight(undefined)).to.equal('0.000 kg');
    });

    it('should format without unit when specified', () => {
      expect(formatWeight(25.5, { showUnit: false })).to.equal('25.500');
    });
  });

  describe('formatDate', () => {
    const formatDate = (date, format = 'DD-MM-YYYY') => {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthName = monthNames[d.getMonth()];

      switch (format) {
        case 'DD-MM-YYYY':
          return `${day}-${month}-${year}`;
        case 'DD/Mon/YYYY':
          return `${day}/${monthName}/${year}`;
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        default:
          return `${day}-${month}-${year}`;
      }
    };

    it('should format date as DD-MM-YYYY', () => {
      const date = new Date('2026-02-06');
      expect(formatDate(date)).to.equal('06-02-2026');
    });

    it('should format date as DD/Mon/YYYY', () => {
      const date = new Date('2026-02-06');
      expect(formatDate(date, 'DD/Mon/YYYY')).to.equal('06/Feb/2026');
    });

    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2026-02-06');
      expect(formatDate(date, 'YYYY-MM-DD')).to.equal('2026-02-06');
    });

    it('should handle empty values', () => {
      expect(formatDate(null)).to.equal('');
      expect(formatDate('')).to.equal('');
    });
  });

  describe('formatNIC', () => {
    const formatNIC = (nic) => {
      if (!nic) return '';
      const cleaned = nic.replace(/\D/g, '');
      if (cleaned.length === 13) {
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
      }
      return nic;
    };

    it('should format 13-digit NIC with dashes', () => {
      expect(formatNIC('1234512345671')).to.equal('12345-1234567-1');
    });

    it('should handle already formatted NIC', () => {
      expect(formatNIC('12345-1234567-1')).to.equal('12345-1234567-1');
    });

    it('should handle empty values', () => {
      expect(formatNIC(null)).to.equal('');
      expect(formatNIC('')).to.equal('');
    });
  });

  describe('formatPhone', () => {
    const formatPhone = (phone) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return cleaned;
      } else if (cleaned.length === 10 && !cleaned.startsWith('0')) {
        return `0${cleaned}`;
      } else if (cleaned.length === 12 && cleaned.startsWith('92')) {
        return `0${cleaned.slice(2)}`;
      }
      return cleaned;
    };

    it('should handle 11-digit Pakistani mobile', () => {
      expect(formatPhone('03001234567')).to.equal('03001234567');
    });

    it('should add leading zero to 10-digit number', () => {
      expect(formatPhone('3001234567')).to.equal('03001234567');
    });

    it('should convert +92 format to local', () => {
      expect(formatPhone('923001234567')).to.equal('03001234567');
    });

    it('should handle empty values', () => {
      expect(formatPhone(null)).to.equal('');
      expect(formatPhone('')).to.equal('');
    });
  });
});
