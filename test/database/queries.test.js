import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import queries from '../../src/database/queries.js';

// Mock the database module using __mocks__
vi.mock('../../src/database/index.js');

// Access the mocked module to set return values
import mockDb, { query, execute } from '../../src/database/index.js';

describe('Database Queries (Mocked)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Settings', () => {
        it('should get settings', () => {
            query.mockReturnValue([{ value: 'test_value' }]);
            const value = queries.settings.get('test_key');
            expect(value).toBe('test_value');
            expect(query).toHaveBeenCalledWith(expect.stringContaining('SELECT value FROM settings'), ['test_key']);
        });

        it('should set settings', () => {
            execute.mockReturnValue({ changes: 1 });
            queries.settings.set('test_key', 'new_value');
            expect(execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO settings'), expect.arrayContaining(['test_key', 'new_value']));
        });
    });

    describe('Suppliers', () => {
        it('should create a supplier', () => {
            const supplierData = {
                name: 'Test Supplier',
                nic: '12345-1234567-1',
                phone: '03001234567',
                // other fields optional/defaulted
            };
            mockDb.execute.mockReturnValue({ lastInsertRowid: 1 });

            const result = queries.suppliers.create(supplierData);

            expect(result.lastInsertRowid).toBe(1);
            // Verify correct parameter mapping (roughly)
            expect(mockDb.execute).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO suppliers'),
                expect.arrayContaining(['Test Supplier', '12345-1234567-1'])
            );
        });

        it('should check for duplicate NIC', () => {
            query.mockReturnValue([{ count: 1 }]);
            const exists = queries.suppliers.checkNic('11111-1111111-1');
            expect(exists).toBe(true);
            expect(query).toHaveBeenCalledWith(expect.stringContaining('SELECT COUNT(*)'), ['11111-1111111-1']);
        });
    });

    describe('Supplier Bills', () => {
        it('should generate preview', () => {
            const mockItems = [
                { id: 1, amount: 100, net_weight: 10 },
                { id: 2, amount: 200, net_weight: 20 }
            ];
            query
                .mockReturnValueOnce(mockItems) // Items query
                .mockReturnValueOnce([{ default_commission_pct: 5.0, advance_amount: 500 }]); // Supplier query

            const preview = queries.supplierBills.generatePreview(1, '2023-01-01', '2023-01-31');

            expect(preview.totalWeight).toBe(30);
            expect(preview.grossAmount).toBe(300);
            expect(preview.supplierAdvance).toBe(500);
        });
    });
});
