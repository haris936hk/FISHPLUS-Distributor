// filepath: test/ipc/handlers.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ipcMain, app } from 'electron';
import db from '../../src/database';
import queries from '../../src/database/queries';
import channels from '../../src/ipc/channels.js';
// registerHandlers loaded dynamically
import printService from '../../src/services/printService.js';
// electron mock is handled by alias in vitest.config.mjs or via test/setup.js
// vi.mock('electron'); // Optional if not automatically mocked, but alias should handle it
vi.mock('electron', () => {
    const handle = vi.fn();
    const invoke = vi.fn();
    const on = vi.fn();
    const removeListener = vi.fn();
    const getVersion = vi.fn(() => '1.0.0');
    const getPath = vi.fn(() => '/mock/path');
    const showSaveDialog = vi.fn();

    const BrowserWindow = vi.fn(() => ({
        loadURL: vi.fn(),
        webContents: {
            print: vi.fn(),
            printToPDF: vi.fn(),
        },
        on: vi.fn(),
        destroy: vi.fn(),
        show: vi.fn(),
        isDestroyed: vi.fn(() => false),
        getFocusedWindow: vi.fn(),
    }));
    BrowserWindow.getAllWindows = vi.fn(() => []);
    BrowserWindow.getFocusedWindow = vi.fn(() => ({}));

    const mockElectron = {
        ipcMain: { handle },
        ipcRenderer: { invoke, on, removeListener },
        app: { getVersion, getPath },
        dialog: { showSaveDialog },
        BrowserWindow,
    };
    return {
        ...mockElectron,
        default: mockElectron,
    };
});


vi.mock('../../src/database', () => ({
    default: {
        query: vi.fn(),
        execute: vi.fn(),
    }
}));

vi.mock('../../src/services/printService.js', () => ({
    default: {
        printReport: vi.fn(),
        printPreview: vi.fn(),
        exportToPDF: vi.fn(),
        exportToExcel: vi.fn(),
    }
}));

// Mock queries object structure
vi.mock('../../src/database/queries', () => ({
    default: {
        dashboard: {
            getSupplierAdvances: vi.fn(),
            getItemsStock: vi.fn(),
            getSummary: vi.fn(),
        },
        suppliers: {
            getAll: vi.fn(),
            getById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            search: vi.fn(),
            checkNic: vi.fn(),
            hasTransactions: vi.fn(),
        },
        customers: {
            getAll: vi.fn(),
            getById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            search: vi.fn(),
            checkNic: vi.fn(),
            hasTransactions: vi.fn(),
        },
        supplierBills: {
            getAll: vi.fn(),
            getById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            generatePreview: vi.fn(),
            getNextBillNumber: vi.fn(),
        },
        items: {
            getAll: vi.fn(),
            getById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            search: vi.fn(),
            checkName: vi.fn(),
            hasTransactions: vi.fn(),
        },
        sales: {
            getAll: vi.fn(),
            getById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            search: vi.fn(),
            getNextSaleNumber: vi.fn(),
        },
        purchases: {
            getAll: vi.fn(),
            getById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            search: vi.fn(),
            getNextPurchaseNumber: vi.fn(),
        },
        reports: {
            getClientRecovery: vi.fn(),
            getItemSales: vi.fn(),
            getDailySales: vi.fn(),
            getLedger: vi.fn(),
            getItemPurchases: vi.fn(),
            getStockReport: vi.fn(),
            getCustomerRegister: vi.fn(),
            getConcessionReport: vi.fn(),
            getDailySalesDetails: vi.fn(),
            getVendorSales: vi.fn(),
            getDailyNetAmountSummary: vi.fn(),
        },
        reference: {
            getCities: vi.fn(),
            getCountries: vi.fn(),
            getCategories: vi.fn(),
        },
        yearEnd: {
            getPreview: vi.fn(),
            process: vi.fn(),
            getHistory: vi.fn(),
        },
    }
}));

describe('IPC Handlers', () => {
    let handlers = {};

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        handlers = {};

        // Capture handlers registered via ipcMain.handle
        // Import manual mock
        const { ipcMain } = await import('electron');
        ipcMain.handle.mockImplementation((channel, handler) => {
            handlers[channel] = handler;
        });

        // Register handlers
        const { registerHandlers } = await import('../../src/ipc/handlers.js');
        registerHandlers();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('registers all expected handlers', () => {
        console.log('DEBUG: Registered handlers:', Object.keys(handlers));
        // Check coverage of some key channels
        expect(handlers[channels.SETTINGS_GET_ALL]).toBeDefined();
        expect(handlers[channels.DASHBOARD_GET_SUMMARY]).toBeDefined();
        expect(handlers[channels.SUPPLIER_GET_ALL]).toBeDefined();
        expect(handlers[channels.CUSTOMER_GET_ALL]).toBeDefined();
        expect(handlers[channels.SALE_CREATE]).toBeDefined();
    });

    describe('Settings Handlers', () => {
        it('SETTINGS_GET_ALL returns settings on success', async () => {
            const mockSettings = [{ key: 'theme', value: 'dark' }];
            db.query.mockReturnValue(mockSettings);

            const result = await handlers[channels.SETTINGS_GET_ALL]();

            expect(result).toEqual({ success: true, data: mockSettings });
        });

        it('SETTINGS_GET_ALL handles errors', async () => {
            db.query.mockImplementation(() => { throw new Error('DB Error'); });

            const result = await handlers[channels.SETTINGS_GET_ALL]();

            expect(result).toEqual({ success: false, error: 'DB Error' });
        });

        it('SETTINGS_SAVE_ONE saves setting', async () => {
            db.execute.mockReturnValue({ changes: 1 });

            const result = await handlers[channels.SETTINGS_SAVE_ONE](null, { key: 'theme', value: 'light' });

            expect(db.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO settings'), ['theme', 'light', 'light']);
            expect(result).toEqual({ success: true, data: { changes: 1 } });
        });
    });

    describe('Supplier Handlers', () => {
        it('SUPPLIER_GET_ALL returns suppliers', async () => {
            const mockSuppliers = [{ id: 1, name: 'Supplier A' }];
            queries.suppliers.getAll.mockReturnValue(mockSuppliers);

            const result = await handlers[channels.SUPPLIER_GET_ALL]();
            expect(result).toEqual({ success: true, data: mockSuppliers });
        });

        it('SUPPLIER_CREATE checks for duplicate NIC', async () => {
            queries.suppliers.checkNic.mockReturnValue(true);

            const result = await handlers[channels.SUPPLIER_CREATE](null, { nic: '12345' });

            expect(result).toEqual({ success: false, error: 'A supplier with this NIC already exists' });
            expect(queries.suppliers.create).not.toHaveBeenCalled();
        });

        it('SUPPLIER_CREATE creates supplier if no duplicate', async () => {
            queries.suppliers.checkNic.mockReturnValue(false);
            queries.suppliers.create.mockReturnValue({ lastInsertRowid: 10 });

            const result = await handlers[channels.SUPPLIER_CREATE](null, { name: 'New Supplier' });

            expect(queries.suppliers.create).toHaveBeenCalled();
            expect(result).toEqual({ success: true, data: { id: 10 } });
        });

        it('SUPPLIER_DELETE prevents deletion if transactions exist', async () => {
            queries.suppliers.hasTransactions.mockReturnValue(true);

            const result = await handlers[channels.SUPPLIER_DELETE](null, 1);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Cannot delete supplier with existing transactions');
            expect(queries.suppliers.delete).not.toHaveBeenCalled();
        });
    });

    describe('Item Handlers', () => {
        it('ITEM_CREATE checks for duplicate name', async () => {
            queries.items.checkName.mockReturnValue(true);
            const result = await handlers[channels.ITEM_CREATE](null, { name: 'Duplicate Item' });
            expect(result).toEqual({ success: false, error: 'An item with this name already exists' });
            expect(queries.items.create).not.toHaveBeenCalled();
        });

        it('ITEM_CREATE creates item if name unique', async () => {
            queries.items.checkName.mockReturnValue(false);
            queries.items.create.mockReturnValue({ lastInsertRowid: 10 });
            const result = await handlers[channels.ITEM_CREATE](null, { name: 'New Item' });
            expect(result).toEqual({ success: true, data: { id: 10 } });
        });

        it('ITEM_UPDATE checks for duplicate name', async () => {
            queries.items.checkName.mockReturnValue(true);
            const result = await handlers[channels.ITEM_UPDATE](null, { id: 1, data: { name: 'Duplicate' } });
            expect(result).toEqual({ success: false, error: 'An item with this name already exists' });
            expect(queries.items.update).not.toHaveBeenCalled();
        });

        it('ITEM_DELETE prevents deletion if transactions exist', async () => {
            queries.items.hasTransactions.mockReturnValue(true);
            const result = await handlers[channels.ITEM_DELETE](null, 1);
            expect(result).toEqual({
                success: false,
                error: 'Cannot delete item with existing transactions. Consider deactivating instead.'
            });
            expect(queries.items.delete).not.toHaveBeenCalled();
        });
    });

    describe('Customer Handlers', () => {
        it('CUSTOMER_CREATE checks for duplicate NIC', async () => {
            queries.customers.checkNic.mockReturnValue(true);
            const result = await handlers[channels.CUSTOMER_CREATE](null, { nic: '12345' });
            expect(result).toEqual({ success: false, error: 'A customer with this NIC already exists' });
        });

        it('CUSTOMER_UPDATE checks for duplicate NIC', async () => {
            queries.customers.checkNic.mockReturnValue(true);
            const result = await handlers[channels.CUSTOMER_UPDATE](null, { id: 1, data: { nic: '12345' } });
            expect(result).toEqual({ success: false, error: 'A customer with this NIC already exists' });
        });

        it('CUSTOMER_DELETE prevents deletion if transactions exist', async () => {
            queries.customers.hasTransactions.mockReturnValue(true);
            const result = await handlers[channels.CUSTOMER_DELETE](null, 1);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Cannot delete customer with existing transactions');
        });
    });

    describe('Sale Handlers', () => {
        it('SALE_CREATE validates customer_id', async () => {
            const result = await handlers[channels.SALE_CREATE](null, { items: [{ id: 1 }] });
            expect(result).toEqual({ success: false, error: 'Customer is required' });
        });

        it('SALE_CREATE validates items', async () => {
            const result = await handlers[channels.SALE_CREATE](null, { customer_id: 1, items: [] });
            expect(result).toEqual({ success: false, error: 'At least one line item is required' });
        });

        it('SALE_CREATE creates sale successfully', async () => {
            queries.sales.create.mockReturnValue({ lastInsertRowid: 5, saleNumber: 'S-100' });
            const result = await handlers[channels.SALE_CREATE](null, { customer_id: 1, items: [{ id: 1 }] });
            expect(result).toEqual({ success: true, data: { id: 5, saleNumber: 'S-100' } });
        });
    });

    describe('Purchase Handlers', () => {
        it('PURCHASE_CREATE validates supplier_id', async () => {
            const result = await handlers[channels.PURCHASE_CREATE](null, { items: [{ id: 1 }] });
            expect(result).toEqual({ success: false, error: 'Supplier is required' });
        });

        it('PURCHASE_CREATE validates items', async () => {
            const result = await handlers[channels.PURCHASE_CREATE](null, { supplier_id: 1, items: [] });
            expect(result).toEqual({ success: false, error: 'At least one line item is required' });
        });

        it('PURCHASE_CREATE creates purchase successfully', async () => {
            queries.purchases.create.mockReturnValue({ lastInsertRowid: 10, purchaseNumber: 'P-100' });
            const result = await handlers[channels.PURCHASE_CREATE](null, { supplier_id: 1, items: [{ id: 1 }] });
            expect(result).toEqual({ success: true, data: { id: 10, purchaseNumber: 'P-100' } });
        });

        it('PURCHASE_UPDATE validates input', async () => {
            const result = await handlers[channels.PURCHASE_UPDATE](null, { id: 1, data: {} });
            expect(result).toEqual({ success: false, error: 'Supplier is required' });
        });

        it('PURCHASE_DELETE executes delete', async () => {
            queries.purchases.delete.mockImplementation(() => { });
            const result = await handlers[channels.PURCHASE_DELETE](null, 1);
            expect(result).toEqual({ success: true });
            expect(queries.purchases.delete).toHaveBeenCalledWith(1);
        });
    });

    describe('Edge Cases', () => {
        it('SUPPLIER_GET_BY_ID returns error if not found', async () => {
            queries.suppliers.getById.mockReturnValue(null);
            const result = await handlers[channels.SUPPLIER_GET_BY_ID](null, 999);
            expect(result).toEqual({ success: false, error: 'Supplier not found' });
        });

        it('SUPPLIER_UPDATE returns error if id is invalid', async () => {
            // This test assumes logic in handler or query to check existence, but standard update might just return 0 changes
            // If the handler doesn't explicitly check existence before update, it might just succeed with 0 changes or fail if DB constraints.
            // Let's assume standard behavior is to try update.
            // However, let's test specific validation if present.
            // The current handler code doesn't explicitly check existence before update, but let's test a DB error.
            queries.suppliers.update.mockImplementation(() => { throw new Error('DB Error'); });
            const result = await handlers[channels.SUPPLIER_UPDATE](null, { id: 999, data: { name: 'New Name' } });
            expect(result).toEqual({ success: false, error: 'DB Error' });
        });


        it('ITEM_GET_BY_ID returns error if not found', async () => {
            queries.items.getById.mockReturnValue(null);
            const result = await handlers[channels.ITEM_GET_BY_ID](null, 999);
            expect(result).toEqual({ success: false, error: 'Item not found' });
        });

        it('SALE_UPDATE validates input', async () => {
            const result = await handlers[channels.SALE_UPDATE](null, { id: 1, data: {} });
            expect(result).toEqual({ success: false, error: 'Customer is required' });
        });

        it('PURCHASE_CREATE validates invalid supplier', async () => {
            const result = await handlers[channels.PURCHASE_CREATE](null, { supplier_id: null, items: [{ id: 1 }] });
            expect(result).toEqual({ success: false, error: 'Supplier is required' });
        });
    });

    describe('Additional Edge Cases', () => {
        it('SUPPLIER_CREATE fails without required fields', async () => {
            // Mocking the query to throw error for missing constraints if checking happens in DB
            queries.suppliers.create.mockImplementation(() => { throw new Error('NOT NULL constraint failed: suppliers.name'); });
            const result = await handlers[channels.SUPPLIER_CREATE](null, {});
            expect(result.success).toBe(false);
            expect(result.error).toContain('NOT NULL constraint failed');
        });

        it('CUSTOMER_CREATE fails without required fields', async () => {
            queries.customers.create.mockImplementation(() => { throw new Error('NOT NULL constraint failed: customers.name'); });
            const result = await handlers[channels.CUSTOMER_CREATE](null, {});
            expect(result.success).toBe(false);
            expect(result.error).toContain('NOT NULL constraint failed');
        });

        it('SALE_CREATE fails with empty items', async () => {
            const result = await handlers[channels.SALE_CREATE](null, { customer_id: 1, items: [] });
            expect(result).toEqual({ success: false, error: 'At least one line item is required' });
        });

        it('SALE_SEARCH handles empty filters', async () => {
            queries.sales.search.mockReturnValue([]);
            const result = await handlers[channels.SALE_SEARCH](null, {});
            expect(result).toEqual({ success: true, data: [] });
            expect(queries.sales.search).toHaveBeenCalledWith({});
        });

        it('REPORT_STOCK handles past dates', async () => {
            queries.reports.getStockReport.mockReturnValue([]);
            const result = await handlers[channels.REPORT_STOCK](null, { asOfDate: '2020-01-01' });
            expect(result).toEqual({ success: true, data: [] });
            expect(queries.reports.getStockReport).toHaveBeenCalledWith('2020-01-01');
        });
    });

    describe('Supplier Bill Handlers', () => {
        it('SUPPLIER_BILL_CREATE creates bill', async () => {
            queries.supplierBills.create.mockReturnValue({ lastInsertRowid: 1, billNumber: 'SB-001' });
            const result = await handlers[channels.SUPPLIER_BILL_CREATE](null, { supplierId: 1, amount: 1000 });
            expect(result).toEqual({ success: true, data: { id: 1, billNumber: 'SB-001' } });
        });

        it('SUPPLIER_BILL_GET_NEXT_NUMBER returns next number', async () => {
            queries.supplierBills.getNextBillNumber.mockReturnValue('SB-101');
            const result = await handlers[channels.SUPPLIER_BILL_GET_NEXT_NUMBER]();
            expect(result).toEqual({ success: true, data: 'SB-101' });
        });
    });

    describe('App Handlers', () => {
        it('APP_GET_VERSION returns app version', () => {
            const result = handlers[channels.APP_GET_VERSION]();
            expect(result).toBe('1.0.0');
        });

        it('APP_GET_PATH returns path', () => {
            const result = handlers[channels.APP_GET_PATH](null, 'userData');
            expect(result).toBe('/mock/path');
        });
    });

    describe('Report Handlers', () => {
        it('REPORT_LEDGER calls correct query', async () => {
            const params = { accountId: 1, dateFrom: '2023-01-01', dateTo: '2023-01-31' };
            queries.reports.getLedger.mockReturnValue([]);

            await handlers[channels.REPORT_LEDGER](null, params);

            expect(queries.reports.getLedger).toHaveBeenCalledWith(1, undefined, '2023-01-01', '2023-01-31');
        });

        it('REPORT_DAILY_SALES calls correct query', async () => {
            const params = { dateFrom: '2023-01-01', dateTo: '2023-01-31' };
            queries.reports.getDailySales.mockReturnValue([]);
            await handlers[channels.REPORT_DAILY_SALES](null, params);
            expect(queries.reports.getDailySales).toHaveBeenCalledWith('2023-01-01', '2023-01-31');
        });

        it('REPORT_STOCK calls correct query', async () => {
            const params = { asOfDate: '2023-01-01' };
            queries.reports.getStockReport.mockReturnValue([]);
            await handlers[channels.REPORT_STOCK](null, params);
            expect(queries.reports.getStockReport).toHaveBeenCalledWith('2023-01-01');
        });
    });

    describe('Print/Export Handlers', () => {
        // Mock printService for these tests
        // printService is imported at top level

        it('PRINT_REPORT delegates to printService', async () => {
            const html = '<h1>Test</h1>';
            await handlers[channels.PRINT_REPORT](null, { htmlContent: html });
            expect(printService.printReport).toHaveBeenCalledWith(expect.anything(), html, undefined);
        });

        it('EXPORT_PDF delegates to printService', async () => {
            const html = '<h1>Test</h1>';
            printService.exportToPDF.mockResolvedValue('/path/to/file.pdf');
            const result = await handlers[channels.EXPORT_PDF](null, { htmlContent: html });
            expect(printService.exportToPDF).toHaveBeenCalledWith(expect.anything(), html, undefined);
            expect(result).toEqual({ success: true, data: { filePath: '/path/to/file.pdf' } });
        });
    });
});
