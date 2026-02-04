const { expect } = require('chai');

describe('Example Test Suite', () => {
  describe('Basic Tests', () => {
    it('should run a simple assertion', () => {
      expect(true).to.be.true;
    });

    it('should perform arithmetic correctly', () => {
      expect(2 + 2).to.equal(4);
    });
  });

  describe('Async Tests', () => {
    it('should handle promises', async () => {
      const result = await Promise.resolve('success');
      expect(result).to.equal('success');
    });
  });

  describe('Object Tests', () => {
    it('should compare objects', () => {
      const obj = { name: 'test', value: 42 };
      expect(obj).to.have.property('name', 'test');
      expect(obj.value).to.equal(42);
    });
  });
});
