import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('../../src/database/index.js');

import db from '../../src/database/index.js';
import queries from '../../src/database/queries.js';

const mockDb = db;

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// Settings queries (pre-existing, kept for completeness)
// ─────────────────────────────────────────────
describe('settings queries', () => {
  it('getAll queries settings table ordered by key', () => {
    mockDb.query.mockReturnValue([]);
    queries.settings.getAll();
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM settings ORDER BY key');
  });

  it('get returns the value from the matching row', () => {
    mockDb.query.mockReturnValue([{ value: 'TestCompany' }]);
    const result = queries.settings.get('company_name');
    expect(mockDb.query).toHaveBeenCalledWith('SELECT value FROM settings WHERE key = ?', [
      'company_name',
    ]);
    expect(result).toBe('TestCompany');
  });

  it('get returns null when key is not found', () => {
    mockDb.query.mockReturnValue([]);
    const result = queries.settings.get('missing_key');
    expect(result).toBeNull();
  });

  it('set upserts the key/value pair', () => {
    mockDb.execute.mockReturnValue({ changes: 1 });
    queries.settings.set('company_name', 'AL-SHEIKH');
    expect(mockDb.execute).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT'), [
      'company_name',
      'AL-SHEIKH',
      'AL-SHEIKH',
    ]);
  });
});

// ─────────────────────────────────────────────
// Supplier queries
// ─────────────────────────────────────────────
describe('suppliers queries', () => {
  it('getAll queries active suppliers with joins', () => {
    mockDb.query.mockReturnValue([]);
    queries.suppliers.getAll();
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('FROM suppliers s'));
  });

  it('getById returns first result or null', () => {
    const supplier = { id: 1, name: 'Test Supplier' };
    mockDb.query.mockReturnValue([supplier]);
    const result = queries.suppliers.getById(1);
    expect(result).toEqual(supplier);
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('WHERE s.id = ?'), [1]);
  });

  it('getById returns null when not found', () => {
    mockDb.query.mockReturnValue([]);
    const result = queries.suppliers.getById(999);
    expect(result).toBeNull();
  });

  it('search wraps name in percent wildcards', () => {
    mockDb.query.mockReturnValue([]);
    queries.suppliers.search('ali');
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LIKE ?'), [
      '%ali%',
      '%ali%',
    ]);
  });

  it('checkNic returns false for empty NIC', () => {
    const result = queries.suppliers.checkNic('');
    expect(result).toBe(false);
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('checkNic returns true when NIC count > 0', () => {
    mockDb.query.mockReturnValue([{ count: 1 }]);
    const result = queries.suppliers.checkNic('12345-1234567-1');
    expect(result).toBe(true);
  });

  it('checkNic excludes current supplier id on update', () => {
    mockDb.query.mockReturnValue([{ count: 0 }]);
    queries.suppliers.checkNic('12345-1234567-1', 5);
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('id != ?'), [
      '12345-1234567-1',
      5,
    ]);
  });

  it('create inserts supplier with correct parameters', () => {
    mockDb.execute.mockReturnValue({ lastInsertRowid: 10 });
    const data = { name: 'Test', nic: '12345-1234567-1', phone: '03001234567' };
    queries.suppliers.create(data);
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO suppliers'),
      expect.arrayContaining(['Test', '12345-1234567-1'])
    );
  });

  it('create defaults opening_balance to 0 when not provided', () => {
    mockDb.execute.mockReturnValue({ lastInsertRowid: 1 });
    queries.suppliers.create({ name: 'Minimal' });
    const args = mockDb.execute.mock.calls[0][1];
    // opening_balance and current_balance (indices 9 and 10) should be 0
    expect(args[9]).toBe(0);
    expect(args[10]).toBe(0);
  });

  it('update executes UPDATE statement with id', () => {
    mockDb.execute.mockReturnValue({ changes: 1 });
    queries.suppliers.update(5, { name: 'Updated' });
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE suppliers SET'),
      expect.arrayContaining([5])
    );
  });

  it('delete soft-deletes by setting is_active = 0', () => {
    mockDb.execute.mockReturnValue({ changes: 1 });
    queries.suppliers.delete(3);
    expect(mockDb.execute).toHaveBeenCalledWith(expect.stringContaining('is_active = 0'), [3]);
  });

  it('hasTransactions returns true when purchase count > 0', () => {
    mockDb.query
      .mockReturnValueOnce([{ count: 1 }]) // purchases
      .mockReturnValueOnce([{ count: 0 }]); // sales
    const result = queries.suppliers.hasTransactions(1);
    expect(result).toBe(true);
  });

  it('hasTransactions returns false when no transactions', () => {
    mockDb.query.mockReturnValue([{ count: 0 }]);
    const result = queries.suppliers.hasTransactions(1);
    expect(result).toBe(false);
  });
});

// ─────────────────────────────────────────────
// Customer queries
// ─────────────────────────────────────────────
describe('customers queries', () => {
  it('getAll queries active customers with joins', () => {
    mockDb.query.mockReturnValue([]);
    queries.customers.getAll();
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('FROM customers c'));
  });

  it('getById returns customer or null', () => {
    const customer = { id: 2, name: 'Test Customer' };
    mockDb.query.mockReturnValue([customer]);
    const result = queries.customers.getById(2);
    expect(result).toEqual(customer);
  });

  it('getById returns null when not found', () => {
    mockDb.query.mockReturnValue([]);
    expect(queries.customers.getById(999)).toBeNull();
  });

  it('checkNic returns false for empty NIC', () => {
    expect(queries.customers.checkNic('')).toBe(false);
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('checkNic returns true when found', () => {
    mockDb.query.mockReturnValue([{ count: 1 }]);
    expect(queries.customers.checkNic('12345-1234567-1')).toBe(true);
  });

  it('create inserts customer with name and email', () => {
    mockDb.execute.mockReturnValue({ lastInsertRowid: 20 });
    queries.customers.create({ name: 'Ahmed', email: 'ahmed@example.com' });
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO customers'),
      expect.arrayContaining(['Ahmed'])
    );
  });

  it('update executes UPDATE with id as last parameter', () => {
    mockDb.execute.mockReturnValue({ changes: 1 });
    queries.customers.update(8, { name: 'Updated Name' });
    const args = mockDb.execute.mock.calls[0][1];
    expect(args[args.length - 1]).toBe(8);
  });

  it('delete soft-deletes customer', () => {
    mockDb.execute.mockReturnValue({ changes: 1 });
    queries.customers.delete(4);
    expect(mockDb.execute).toHaveBeenCalledWith(expect.stringContaining('is_active = 0'), [4]);
  });

  it('hasTransactions checks sales table', () => {
    mockDb.query
      .mockReturnValueOnce([{ count: 1 }]) // sales
      .mockReturnValueOnce([{ count: 0 }]); // payments
    expect(queries.customers.hasTransactions(2)).toBe(true);
  });

  it('hasTransactions returns false when no history', () => {
    mockDb.query.mockReturnValue([{ count: 0 }]);
    expect(queries.customers.hasTransactions(2)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// Items queries
// ─────────────────────────────────────────────
describe('items queries', () => {
  it('getAll joins category table', () => {
    mockDb.query.mockReturnValue([]);
    queries.items.getAll();
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN categories'));
  });

  it('checkName returns false for empty name', () => {
    expect(queries.items.checkName('')).toBe(false);
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('checkName returns true when name already exists', () => {
    mockDb.query.mockReturnValue([{ count: 1 }]);
    expect(queries.items.checkName('Rohu')).toBe(true);
  });

  it('checkName excludes current id for update check', () => {
    mockDb.query.mockReturnValue([{ count: 0 }]);
    queries.items.checkName('Rohu', 3);
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('id != ?'), ['Rohu', 3]);
  });

  it('create inserts item with name and unit_price', () => {
    mockDb.execute.mockReturnValue({ lastInsertRowid: 5 });
    queries.items.create({ name: 'Rohu', unit_price: 250 });
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO items'),
      expect.arrayContaining(['Rohu'])
    );
  });

  it('create defaults unit_price to 0 when not provided', () => {
    mockDb.execute.mockReturnValue({ lastInsertRowid: 6 });
    queries.items.create({ name: 'Catla' });
    const args = mockDb.execute.mock.calls[0][1];
    // unit_price is index 3
    expect(args[3]).toBe(0);
  });

  it('update passes id as last parameter', () => {
    mockDb.execute.mockReturnValue({ changes: 1 });
    queries.items.update(7, { name: 'Catla Updated', unit_price: 300 });
    const args = mockDb.execute.mock.calls[0][1];
    expect(args[args.length - 1]).toBe(7);
  });

  it('delete soft-deletes item', () => {
    mockDb.execute.mockReturnValue({ changes: 1 });
    queries.items.delete(2);
    expect(mockDb.execute).toHaveBeenCalledWith(expect.stringContaining('is_active = 0'), [2]);
  });

  it('hasTransactions returns true when sale_items exist', () => {
    mockDb.query
      .mockReturnValueOnce([{ count: 1 }]) // sale_items
      .mockReturnValueOnce([{ count: 0 }]); // purchase_items
    expect(queries.items.hasTransactions(1)).toBe(true);
  });

  it('hasTransactions returns false when no history', () => {
    mockDb.query.mockReturnValue([{ count: 0 }]);
    expect(queries.items.hasTransactions(1)).toBe(false);
  });
});

// ─────────────────────────────────────────────────
// Reference queries
// ─────────────────────────────────────────────────
describe('reference queries', () => {
  it('getCities joins countries table', () => {
    mockDb.query.mockReturnValue([]);
    queries.reference.getCities();
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN countries'));
  });

  it('getCountries queries active countries', () => {
    mockDb.query.mockReturnValue([]);
    queries.reference.getCountries();
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM countries WHERE is_active = 1')
    );
  });

  it('getCategories queries active categories', () => {
    mockDb.query.mockReturnValue([]);
    queries.reference.getCategories();
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM categories WHERE is_active = 1')
    );
  });
});

// ─────────────────────────────────────────────────
// Dashboard queries
// ─────────────────────────────────────────────────
describe('dashboard queries', () => {
  it('getSummary makes 4 separate database queries', () => {
    mockDb.query.mockReturnValue([{ count: 0 }]);
    queries.dashboard.getSummary();
    expect(mockDb.query).toHaveBeenCalledTimes(4);
  });

  it('getSummary returns default values when all queries return empty', () => {
    mockDb.query.mockReturnValue([]);
    const result = queries.dashboard.getSummary();
    expect(result.suppliers).toEqual({ count: 0, total_advances: 0 });
    expect(result.customers).toEqual({ count: 0, total_balance: 0 });
    expect(result.items).toEqual({ count: 0 });
    expect(result.todaySales).toEqual({ count: 0, total: 0 });
  });

  it('getItemsStock joins categories table', () => {
    mockDb.query.mockReturnValue([]);
    queries.dashboard.getItemsStock();
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN categories c'));
  });

  it('getSupplierAdvances filters for advance_amount > 0', () => {
    mockDb.query.mockReturnValue([]);
    queries.dashboard.getSupplierAdvances();
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('advance_amount > 0'));
  });
});

// ─────────────────────────────────────────────────
// Sales queries
// ─────────────────────────────────────────────────
describe('sales queries', () => {
  it('getNextSaleNumber returns fallback when no sequence row found', () => {
    mockDb.query.mockReturnValue([]);
    const num = queries.sales.getNextSaleNumber();
    expect(num).toBe('SL-000001');
  });

  it('getNextSaleNumber formats number with correct padding', () => {
    mockDb.query.mockReturnValue([{ prefix: 'SL-', current_number: 5, number_length: 6 }]);
    const num = queries.sales.getNextSaleNumber();
    expect(num).toBe('SL-000006');
  });

  it('create inserts sale header and line items', () => {
    // Setup mocks: sequence + sale insert + item stock updates + sequence update + customer balance update
    mockDb.query.mockReturnValueOnce([{ prefix: 'SL-', current_number: 0, number_length: 6 }]); // getNextSaleNumber
    mockDb.execute.mockReturnValue({ lastInsertRowid: 1 });

    const saleData = {
      customer_id: 1,
      sale_date: '2026-02-06',
      items: [
        {
          item_id: 1,
          customer_id: 1,
          weight: 90,
          rate: 200,
          fare_charges: 0,
          ice_charges: 0,
          cash_amount: 0,
          receipt_amount: 0,
        },
      ],
    };

    queries.sales.create(saleData);

    // Should have called execute: 1x sale header + 1x line item + 1x stock update + 1x sequence + 1x customer balance
    expect(mockDb.execute).toHaveBeenCalledTimes(5);
  });

  it('create calculates correct net amount for sale header', () => {
    mockDb.query.mockReturnValueOnce([{ prefix: 'SL-', current_number: 0, number_length: 6 }]);
    mockDb.execute.mockReturnValue({ lastInsertRowid: 1 });

    // New schema: weight-based, no gross/tare split
    // lineAmount = weight * rate = 90 * 200 = 18000
    // netAmount = grossAmount + fareCharges + iceCharges = 18000 + 100 + 50 = 18150
    const saleData = {
      customer_id: 1,
      sale_date: '2026-02-06',
      items: [
        {
          item_id: 1,
          customer_id: 1,
          weight: 90,
          rate: 200,
          fare_charges: 100,
          ice_charges: 50,
          cash_amount: 0,
          receipt_amount: 0,
        },
      ],
    };

    queries.sales.create(saleData);

    // netAmount is at index 12 in INSERT params
    // (sale_number[0], sale_date[1], customer_id[2], supplier_id[3], vehicle_number[4], details[5],
    //  total_weight[6], net_weight[7], gross_amount[8], fare_charges[9], ice_charges[10],
    //  discount_amount[11], net_amount[12], ...)
    const saleInsertCall = mockDb.execute.mock.calls[0];
    const params = saleInsertCall[1];
    expect(params[12]).toBe(18150);
  });

  it('search adds customer filter when not allCustomers', () => {
    mockDb.query.mockReturnValue([]);
    queries.sales.search({ customerId: 5, allCustomers: false });
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('customer_id = ?'),
      expect.arrayContaining([5])
    );
  });

  it('search omits customer filter when allCustomers is true', () => {
    mockDb.query.mockReturnValue([]);
    queries.sales.search({ customerId: 5, allCustomers: true });
    const callArgs = mockDb.query.mock.calls[0];
    expect(callArgs[0]).not.toContain('customer_id = ?');
  });
});

// ─────────────────────────────────────────────────
// Purchases queries
// ─────────────────────────────────────────────────
describe('purchases queries', () => {
  it('getNextPurchaseNumber returns fallback when no sequence row found', () => {
    mockDb.query.mockReturnValue([]);
    const num = queries.purchases.getNextPurchaseNumber();
    expect(num).toBe('PO-000001');
  });

  it('getNextPurchaseNumber formats number with correct padding', () => {
    mockDb.query.mockReturnValue([{ prefix: 'PO-', current_number: 9, number_length: 6 }]);
    const num = queries.purchases.getNextPurchaseNumber();
    expect(num).toBe('PO-000010');
  });

  it('create inserts purchase header and line items', () => {
    mockDb.query
      .mockReturnValueOnce([{ prefix: 'PO-', current_number: 0, number_length: 6 }])
      .mockReturnValueOnce([{ current_balance: 0 }]);
    mockDb.execute.mockReturnValue({ lastInsertRowid: 1 });

    queries.purchases.create({
      supplier_id: 1,
      purchase_date: '2026-02-06',
      items: [{ item_id: 1, weight: 50, rate: 120 }],
    });

    // purchase header + line item + stock update + sequence update + supplier balance
    expect(mockDb.execute).toHaveBeenCalledTimes(5);
  });

  it('create calculates correct net amount (gross - concession)', () => {
    mockDb.query
      .mockReturnValueOnce([{ prefix: 'PO-', current_number: 0, number_length: 6 }])
      .mockReturnValueOnce([{ current_balance: 0 }]);
    mockDb.execute.mockReturnValue({ lastInsertRowid: 1 });

    queries.purchases.create({
      supplier_id: 1,
      purchase_date: '2026-02-06',
      concession_amount: 500,
      items: [{ item_id: 1, weight: 100, rate: 120, amount: 12000 }],
    });

    // grossAmount = 12000 (from item.amount), netAmount = 12000 - 500 = 11500
    const purchaseInsertCall = mockDb.execute.mock.calls[0];
    const params = purchaseInsertCall[1];
    // net_amount is at index 8 in INSERT params
    expect(params[8]).toBe(11500);
  });

  it('search adds supplier filter when filterBySupplier is true', () => {
    mockDb.query.mockReturnValue([]);
    queries.purchases.search({ filterBySupplier: true, supplierId: 3 });
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('supplier_id = ?'),
      expect.arrayContaining([3])
    );
  });
});

// ─────────────────────────────────────────────────
// Supplier Bills queries
// ─────────────────────────────────────────────────
describe('supplierBills queries', () => {
  it('getNextBillNumber returns fallback when no sequence', () => {
    mockDb.query.mockReturnValue([]);
    const num = queries.supplierBills.getNextBillNumber();
    expect(num).toBe('BILL-000001');
  });

  it('getNextBillNumber formats correctly from sequence', () => {
    mockDb.query.mockReturnValue([{ prefix: 'BILL-', current_number: 2, number_length: 6 }]);
    const num = queries.supplierBills.getNextBillNumber();
    expect(num).toBe('BILL-000003');
  });

  it('generatePreview fetches items and supplier defaults', () => {
    mockDb.query
      .mockReturnValueOnce([]) // sale items
      .mockReturnValueOnce([{ default_commission_pct: 5.0, advance_amount: 1000 }]); // supplier
    const result = queries.supplierBills.generatePreview(1, '2026-01-01', '2026-01-31');
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('totalWeight');
    expect(result).toHaveProperty('grossAmount');
    expect(result.defaultCommissionPct).toBe(5.0);
    expect(result.supplierAdvance).toBe(1000);
  });

  it('generatePreview calculates totals from items', () => {
    const mockItems = [
      { weight: 100, amount: 15000 },
      { weight: 50, amount: 7500 },
    ];
    mockDb.query
      .mockReturnValueOnce(mockItems) // sale items
      .mockReturnValueOnce([{ default_commission_pct: 5.0, advance_amount: 0 }]); // supplier
    const result = queries.supplierBills.generatePreview(1, '2026-01-01', '2026-01-31');
    expect(result.totalWeight).toBe(150);
    expect(result.grossAmount).toBe(22500);
  });

  it('delete only removes draft bills', () => {
    mockDb.execute.mockReturnValue({ changes: 1 });
    queries.supplierBills.delete(5);
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining("status = 'deleted'"),
      expect.arrayContaining([5])
    );
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining("status = 'draft'"),
      expect.arrayContaining([5])
    );
  });
});
