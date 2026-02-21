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
// Client Recovery Report  (FR-CLIENTRPT-*)
// ─────────────────────────────────────────────
describe('reports.getClientRecovery', () => {
    it('makes two db.query calls (transactions + summary)', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getClientRecovery(1, '2026-01-01', '2026-01-31', false);
        expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('returns object with transactions and summary keys', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getClientRecovery(1, '2026-01-01', '2026-01-31', false);
        expect(result).toHaveProperty('transactions');
        expect(result).toHaveProperty('summary');
    });

    it('adds customer filter when not allClients', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getClientRecovery(5, '2026-01-01', '2026-01-31', false);
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[0]).toContain('customer_id = ?');
        expect(firstCall[1]).toContain(5);
    });

    it('omits customer filter when allClients is true', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getClientRecovery(5, '2026-01-01', '2026-01-31', true);
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[0]).not.toContain('customer_id = ?');
    });

    it('passes dateFrom and dateTo to both queries', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getClientRecovery(null, '2026-02-01', '2026-02-28', true);
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[1]).toContain('2026-02-01');
        expect(firstCall[1]).toContain('2026-02-28');
    });
});

// ─────────────────────────────────────────────
// Item Sale Report  (FR-ITEMRPT-*)
// ─────────────────────────────────────────────
describe('reports.getItemSales', () => {
    it('returns object with transactions and summary', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getItemSales(1, '2026-01-01', '2026-01-31');
        expect(result).toHaveProperty('transactions');
        expect(result).toHaveProperty('summary');
    });

    it('passes itemId as first parameter', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getItemSales(7, '2026-01-01', '2026-01-31');
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[1][0]).toBe(7);
    });

    it('returns empty summary object when query has no results', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getItemSales(1, '2026-01-01', '2026-01-31');
        expect(result.summary).toEqual({});
    });

    it('unwraps first row of summary', () => {
        mockDb.query
            .mockReturnValueOnce([]) // transactions
            .mockReturnValueOnce([{ total_weight: 500, total_amount: 75000, avg_rate: 150 }]); // summary
        const result = queries.reports.getItemSales(1, '2026-01-01', '2026-01-31');
        expect(result.summary.total_weight).toBe(500);
        expect(result.summary.avg_rate).toBe(150);
    });
});

// ─────────────────────────────────────────────
// Daily Sales Report  (FR-DAILYRPT-*)
// ─────────────────────────────────────────────
describe('reports.getDailySales', () => {
    it('returns byItem and totals', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getDailySales('2026-01-01', '2026-01-31');
        expect(result).toHaveProperty('byItem');
        expect(result).toHaveProperty('totals');
    });

    it('makes two db.query calls (byItem + totals)', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getDailySales('2026-01-01', '2026-01-31');
        expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('groups by item (byItem query uses GROUP BY)', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getDailySales('2026-01-01', '2026-01-31');
        const firstQuery = mockDb.query.mock.calls[0][0];
        expect(firstQuery).toContain('GROUP BY');
    });

    it('totals defaults to empty object when query returns nothing', () => {
        mockDb.query
            .mockReturnValueOnce([]) // byItem
            .mockReturnValueOnce([]); // totals
        const result = queries.reports.getDailySales('2026-01-01', '2026-01-31');
        expect(result.totals).toEqual({});
    });
});

// ─────────────────────────────────────────────
// Ledger Report  (FR-LEDGER-*)
// ─────────────────────────────────────────────
describe('reports.getLedger', () => {
    it('returns openingBalance and transactions for customer', () => {
        mockDb.query
            .mockReturnValueOnce([{ opening_balance: 5000 }]) // opening balance
            .mockReturnValueOnce([]);                          // transactions
        const result = queries.reports.getLedger(1, 'customer', '2026-01-01', '2026-01-31');
        expect(result).toHaveProperty('openingBalance');
        expect(result).toHaveProperty('transactions');
        expect(result.openingBalance).toBe(5000);
    });

    it('returns openingBalance and transactions for supplier', () => {
        mockDb.query
            .mockReturnValueOnce([{ opening_balance: 8000 }])
            .mockReturnValueOnce([]);
        const result = queries.reports.getLedger(2, 'supplier', '2026-01-01', '2026-01-31');
        expect(result.openingBalance).toBe(8000);
    });

    it('defaults opening balance to 0 when query returns nothing', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getLedger(1, 'customer', '2026-01-01', '2026-01-31');
        expect(result.openingBalance).toBe(0);
    });

    it('uses different SQL path for supplier vs customer', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getLedger(1, 'supplier', '2026-01-01', '2026-01-31');
        const firstQuery = mockDb.query.mock.calls[0][0];
        expect(firstQuery).toContain('suppliers');
        expect(firstQuery).not.toContain('customers c WHERE c.id');
    });
});

// ─────────────────────────────────────────────
// Item Purchase Report  (FR-ITEMPURCHRPT-*)
// ─────────────────────────────────────────────
describe('reports.getItemPurchases', () => {
    it('returns transactions and summary', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getItemPurchases(1, '2026-01-01', '2026-01-31');
        expect(result).toHaveProperty('transactions');
        expect(result).toHaveProperty('summary');
    });

    it('passes itemId as first parameter to both queries', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getItemPurchases(4, '2026-01-01', '2026-01-31');
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[1][0]).toBe(4);
        const secondCall = mockDb.query.mock.calls[1];
        expect(secondCall[1][0]).toBe(4);
    });
});

// ─────────────────────────────────────────────
// Stock Report  (FR-STOCKRPT-*)
// ─────────────────────────────────────────────
describe('reports.getStockReport', () => {
    it('returns items array and totals', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getStockReport('2026-02-06');
        expect(result).toHaveProperty('items');
        expect(result).toHaveProperty('totals');
    });

    it('calculates previous_stock: opening + purchases_before - sales_before', () => {
        const mockItems = [
            { opening_stock: 100, purchases_before: 50, sales_before: 30, today_purchases: 0, today_sales: 0 },
        ];
        mockDb.query.mockReturnValue(mockItems);
        const result = queries.reports.getStockReport('2026-02-06');
        // previous_stock = 100 + 50 - 30 = 120
        expect(result.items[0].previous_stock).toBe(120);
    });

    it('calculates remaining_stock: previous + today_purchases - today_sales', () => {
        const mockItems = [
            { opening_stock: 100, purchases_before: 50, sales_before: 30, today_purchases: 20, today_sales: 15 },
        ];
        mockDb.query.mockReturnValue(mockItems);
        const result = queries.reports.getStockReport('2026-02-06');
        // previous = 120, remaining = 120 + 20 - 15 = 125
        expect(result.items[0].remaining_stock).toBe(125);
    });

    it('aggregates totals across all items', () => {
        const mockItems = [
            { opening_stock: 100, purchases_before: 20, sales_before: 10, today_purchases: 5, today_sales: 3 },
            { opening_stock: 200, purchases_before: 40, sales_before: 20, today_purchases: 10, today_sales: 6 },
        ];
        mockDb.query.mockReturnValue(mockItems);
        const result = queries.reports.getStockReport('2026-02-06');
        // Item1: prev=110, remaining=112; Item2: prev=220, remaining=224
        expect(result.totals.previous_stock).toBe(330);
        expect(result.totals.remaining_stock).toBe(336);
    });

    it('passes asOfDate to query 4 times (for each subquery)', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getStockReport('2026-02-06');
        const firstCall = mockDb.query.mock.calls[0];
        const params = firstCall[1];
        expect(params).toHaveLength(4);
        expect(params.every(p => p === '2026-02-06')).toBe(true);
    });
});

// ─────────────────────────────────────────────
// Customer Register  (FR-CUSTREG-*)
// ─────────────────────────────────────────────
describe('reports.getCustomerRegister', () => {
    it('returns customers array and totals', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getCustomerRegister('2026-02-06');
        expect(result).toHaveProperty('customers');
        expect(result).toHaveProperty('totals');
    });

    it('calculates balance as opening + sales - payments', () => {
        const mockCustomers = [
            { opening_balance: 71500, total_sales: 0, total_payments: 0 },
        ];
        mockDb.query.mockReturnValue(mockCustomers);
        const result = queries.reports.getCustomerRegister('2026-02-06');
        // balance = 71500 + 0 - 0 = 71500
        expect(result.customers[0].balance).toBe(71500);
    });

    it('aggregates totals across customers', () => {
        const mockCustomers = [
            { opening_balance: 1000, total_sales: 5000, total_payments: 2000 },
            { opening_balance: 2000, total_sales: 3000, total_payments: 1000 },
        ];
        mockDb.query.mockReturnValue(mockCustomers);
        const result = queries.reports.getCustomerRegister('2026-02-06');
        expect(result.totals.previous).toBe(3000);
        expect(result.totals.net_amount).toBe(8000);
        expect(result.totals.collection).toBe(3000);
    });
});

// ─────────────────────────────────────────────
// Concession Report  (FR-CONCESSIONRPT-*)
// ─────────────────────────────────────────────
describe('reports.getConcessionReport', () => {
    it('returns transactions and totalConcession', () => {
        mockDb.query
            .mockReturnValueOnce([]) // transactions
            .mockReturnValueOnce([{ total_concession: 0 }]); // total
        const result = queries.reports.getConcessionReport(1, '2026-01-01', '2026-01-31', false);
        expect(result).toHaveProperty('transactions');
        expect(result).toHaveProperty('totalConcession');
    });

    it('only returns sales with discount_amount > 0', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getConcessionReport(1, '2026-01-01', '2026-01-31', false);
        const firstQuery = mockDb.query.mock.calls[0][0];
        expect(firstQuery).toContain('discount_amount > 0');
    });

    it('adds customer filter when not allClients', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getConcessionReport(9, '2026-01-01', '2026-01-31', false);
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[0]).toContain('customer_id = ?');
        expect(firstCall[1]).toContain(9);
    });

    it('omits customer filter when allClients is true', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getConcessionReport(9, '2026-01-01', '2026-01-31', true);
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[0]).not.toContain('customer_id = ?');
    });

    it('defaults totalConcession to 0 when query returns nothing', () => {
        mockDb.query
            .mockReturnValueOnce([])
            .mockReturnValueOnce([]);
        const result = queries.reports.getConcessionReport(1, '2026-01-01', '2026-01-31', false);
        expect(result.totalConcession).toBe(0);
    });
});

// ─────────────────────────────────────────────
// Daily Sales Details  (FR-DAILYDETAIL-*)
// ─────────────────────────────────────────────
describe('reports.getDailySalesDetails', () => {
    it('returns transactions and totals', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getDailySalesDetails('2026-02-06');
        expect(result).toHaveProperty('transactions');
        expect(result).toHaveProperty('totals');
    });

    it('passes single date for an exact date match (DATE = DATE(?))', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getDailySalesDetails('2026-02-06');
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[0]).toContain('DATE(s.sale_date) = DATE(?)');
        expect(firstCall[1]).toEqual(['2026-02-06']);
    });

    it('orders results by sale_number and line_number', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getDailySalesDetails('2026-02-06');
        const firstQuery = mockDb.query.mock.calls[0][0];
        expect(firstQuery).toContain('ORDER BY');
        expect(firstQuery).toContain('line_number');
    });
});

// ─────────────────────────────────────────────
// Vendor Sales Report  (FR-VENDORSALES-*)
// ─────────────────────────────────────────────
describe('reports.getVendorSales', () => {
    it('returns transactions, summary and grandTotals', () => {
        mockDb.query.mockReturnValue([]);
        const result = queries.reports.getVendorSales(1, '2026-01-01', '2026-01-31', false);
        expect(result).toHaveProperty('transactions');
        expect(result).toHaveProperty('summary');
        expect(result).toHaveProperty('grandTotals');
    });

    it('filters by supplier when not allVendors', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getVendorSales(4, '2026-01-01', '2026-01-31', false);
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[0]).toContain('supplier_id = ?');
        expect(firstCall[1]).toContain(4);
    });

    it('omits supplier filter when allVendors is true', () => {
        mockDb.query.mockReturnValue([]);
        queries.reports.getVendorSales(4, '2026-01-01', '2026-01-31', true);
        const firstCall = mockDb.query.mock.calls[0];
        expect(firstCall[0]).not.toContain('AND si.supplier_id = ?');
    });

    it('reduces summary rows into grandTotals correctly', () => {
        mockDb.query
            .mockReturnValueOnce([]) // transactions
            .mockReturnValueOnce([   // summary
                { vehicle_count: 3, total_weight: 100, total_amount: 15000 },
                { vehicle_count: 2, total_weight: 80, total_amount: 12000 },
            ]);
        const result = queries.reports.getVendorSales(null, '2026-01-01', '2026-01-31', true);
        expect(result.grandTotals.total_vehicles).toBe(5);
        expect(result.grandTotals.total_weight).toBe(180);
        expect(result.grandTotals.total_amount).toBe(27000);
    });
});

// ─────────────────────────────────────────────
// Daily Net Amount Summary  (FR-NETSUMMARY-*)
// ─────────────────────────────────────────────
describe('reports.getDailyNetAmountSummary', () => {
    it('returns all expected keys', () => {
        mockDb.query.mockReturnValue([{ previous_balance: 0, today_sales: 0, today_charges: 0, today_discount: 0, today_collection: 0, today_payments: 0 }]);
        const result = queries.reports.getDailyNetAmountSummary('2026-02-06');
        expect(result).toHaveProperty('previousBalance');
        expect(result).toHaveProperty('todaySales');
        expect(result).toHaveProperty('totalAmount');
        expect(result).toHaveProperty('totalCollection');
        expect(result).toHaveProperty('closingBalance');
        expect(result).toHaveProperty('asOfDate');
    });

    it('calculates totalAmount as previousBalance + todaySales', () => {
        mockDb.query
            .mockReturnValueOnce([{ previous_balance: 10000 }]) // prev balance
            .mockReturnValueOnce([{ today_sales: 2500, today_charges: 0, today_discount: 0 }])
            .mockReturnValueOnce([{ today_collection: 0 }])
            .mockReturnValueOnce([{ today_payments: 0 }]);
        const result = queries.reports.getDailyNetAmountSummary('2026-02-06');
        expect(result.previousBalance).toBe(10000);
        expect(result.todaySales).toBe(2500);
        expect(result.totalAmount).toBe(12500);
    });

    it('calculates closingBalance as totalAmount - totalCollection', () => {
        mockDb.query
            .mockReturnValueOnce([{ previous_balance: 10000 }])
            .mockReturnValueOnce([{ today_sales: 2500, today_charges: 0, today_discount: 0 }])
            .mockReturnValueOnce([{ today_collection: 1000 }])
            .mockReturnValueOnce([{ today_payments: 500 }]);
        const result = queries.reports.getDailyNetAmountSummary('2026-02-06');
        // totalCollection = 1000 + 500 = 1500; closingBalance = 12500 - 1500 = 11000
        expect(result.totalCollection).toBe(1500);
        expect(result.closingBalance).toBe(11000);
    });

    it('returns the asOfDate in the result', () => {
        mockDb.query.mockReturnValue([{}]);
        const result = queries.reports.getDailyNetAmountSummary('2026-02-06');
        expect(result.asOfDate).toBe('2026-02-06');
    });
});
