const { ipcMain, app } = require('electron');
const channels = require('./channels');
const db = require('../database');
const queries = require('../database/queries');

/**
 * Register all IPC handlers
 */
function registerHandlers() {
  // Database handlers
  // Settings handlers
  ipcMain.handle(channels.SETTINGS_GET_ALL, async () => {
    try {
      const result = db.query('SELECT key, value FROM settings');
      return { success: true, data: result };
    } catch (error) {
      console.error('Settings fetch error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SETTINGS_SAVE_ONE, async (event, { key, value }) => {
    try {
      const result = db.execute(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
        [key, value, value]
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('Settings save error:', error);
      return { success: false, error: error.message };
    }
  });

  // Dashboard handlers
  ipcMain.handle(channels.DASHBOARD_GET_SUPPLIER_ADVANCES, async () => {
    try {
      const result = queries.dashboard.getSupplierAdvances();
      return { success: true, data: result };
    } catch (error) {
      console.error('Dashboard supplier advances error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.DASHBOARD_GET_ITEMS_STOCK, async () => {
    try {
      const result = queries.dashboard.getItemsStock();
      return { success: true, data: result };
    } catch (error) {
      console.error('Dashboard items stock error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.DASHBOARD_GET_SUMMARY, async () => {
    try {
      const result = queries.dashboard.getSummary();
      return { success: true, data: result };
    } catch (error) {
      console.error('Dashboard summary error:', error);
      return { success: false, error: error.message };
    }
  });

  // Supplier handlers
  ipcMain.handle(channels.SUPPLIER_GET_ALL, async () => {
    try {
      const result = queries.suppliers.getAll();
      return { success: true, data: result };
    } catch (error) {
      console.error('Supplier getAll error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_GET_BY_ID, async (event, id) => {
    try {
      const result = queries.suppliers.getById(id);
      if (!result) {
        return { success: false, error: 'Supplier not found' };
      }
      return { success: true, data: result };
    } catch (error) {
      console.error('Supplier getById error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_CREATE, async (event, data) => {
    try {
      // Check for duplicate NIC if provided
      if (data.nic && queries.suppliers.checkNic(data.nic)) {
        return { success: false, error: 'A supplier with this NIC already exists' };
      }
      const result = queries.suppliers.create(data);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch (error) {
      console.error('Supplier create error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_UPDATE, async (event, { id, data }) => {
    try {
      // Check for duplicate NIC if provided (excluding current supplier)
      if (data.nic && queries.suppliers.checkNic(data.nic, id)) {
        return { success: false, error: 'A supplier with this NIC already exists' };
      }
      queries.suppliers.update(id, data);
      return { success: true };
    } catch (error) {
      console.error('Supplier update error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_DELETE, async (event, id) => {
    try {
      // Check if supplier has transactions
      if (queries.suppliers.hasTransactions(id)) {
        return {
          success: false,
          error: 'Cannot delete supplier with existing transactions. Consider deactivating instead.'
        };
      }
      queries.suppliers.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Supplier delete error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_SEARCH, async (event, name) => {
    try {
      const result = queries.suppliers.search(name || '');
      return { success: true, data: result };
    } catch (error) {
      console.error('Supplier search error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_CHECK_NIC, async (event, { nic, excludeId }) => {
    try {
      const exists = queries.suppliers.checkNic(nic, excludeId);
      return { success: true, data: { exists } };
    } catch (error) {
      console.error('Supplier checkNic error:', error);
      return { success: false, error: error.message };
    }
  });

  // Customer handlers
  ipcMain.handle(channels.CUSTOMER_GET_ALL, async () => {
    try {
      const result = queries.customers.getAll();
      return { success: true, data: result };
    } catch (error) {
      console.error('Customer getAll error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.CUSTOMER_GET_BY_ID, async (event, id) => {
    try {
      const result = queries.customers.getById(id);
      if (!result) {
        return { success: false, error: 'Customer not found' };
      }
      return { success: true, data: result };
    } catch (error) {
      console.error('Customer getById error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.CUSTOMER_CREATE, async (event, data) => {
    try {
      // Check for duplicate NIC if provided
      if (data.nic && queries.customers.checkNic(data.nic)) {
        return { success: false, error: 'A customer with this NIC already exists' };
      }
      const result = queries.customers.create(data);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch (error) {
      console.error('Customer create error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.CUSTOMER_UPDATE, async (event, { id, data }) => {
    try {
      // Check for duplicate NIC if provided (excluding current customer)
      if (data.nic && queries.customers.checkNic(data.nic, id)) {
        return { success: false, error: 'A customer with this NIC already exists' };
      }
      queries.customers.update(id, data);
      return { success: true };
    } catch (error) {
      console.error('Customer update error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.CUSTOMER_DELETE, async (event, id) => {
    try {
      // Check if customer has transactions
      if (queries.customers.hasTransactions(id)) {
        return {
          success: false,
          error: 'Cannot delete customer with existing transactions. Consider deactivating instead.'
        };
      }
      queries.customers.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Customer delete error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.CUSTOMER_SEARCH, async (event, name) => {
    try {
      const result = queries.customers.search(name || '');
      return { success: true, data: result };
    } catch (error) {
      console.error('Customer search error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.CUSTOMER_CHECK_NIC, async (event, { nic, excludeId }) => {
    try {
      const exists = queries.customers.checkNic(nic, excludeId);
      return { success: true, data: { exists } };
    } catch (error) {
      console.error('Customer checkNic error:', error);
      return { success: false, error: error.message };
    }
  });

  // Reference data handlers
  ipcMain.handle(channels.REFERENCE_GET_CITIES, async () => {
    try {
      const result = queries.reference.getCities();
      return { success: true, data: result };
    } catch (error) {
      console.error('Reference getCities error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.REFERENCE_GET_COUNTRIES, async () => {
    try {
      const result = queries.reference.getCountries();
      return { success: true, data: result };
    } catch (error) {
      console.error('Reference getCountries error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.REFERENCE_GET_CATEGORIES, async () => {
    try {
      const result = queries.reference.getCategories();
      return { success: true, data: result };
    } catch (error) {
      console.error('Reference getCategories error:', error);
      return { success: false, error: error.message };
    }
  });

  // Supplier Bill handlers
  ipcMain.handle(channels.SUPPLIER_BILL_GET_ALL, async () => {
    try {
      const result = queries.supplierBills.getAll();
      return { success: true, data: result };
    } catch (error) {
      console.error('Supplier Bill getAll error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_BILL_GET_BY_ID, async (event, id) => {
    try {
      const result = queries.supplierBills.getById(id);
      if (!result) {
        return { success: false, error: 'Supplier bill not found' };
      }
      return { success: true, data: result };
    } catch (error) {
      console.error('Supplier Bill getById error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_BILL_CREATE, async (event, data) => {
    try {
      const result = queries.supplierBills.create(data);
      return { success: true, data: { id: result.lastInsertRowid, billNumber: result.billNumber } };
    } catch (error) {
      console.error('Supplier Bill create error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_BILL_UPDATE, async (event, { id, data }) => {
    try {
      queries.supplierBills.update(id, data);
      return { success: true };
    } catch (error) {
      console.error('Supplier Bill update error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_BILL_DELETE, async (event, id) => {
    try {
      queries.supplierBills.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Supplier Bill delete error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_BILL_GENERATE_PREVIEW, async (event, { supplierId, dateFrom, dateTo }) => {
    try {
      const result = queries.supplierBills.generatePreview(supplierId, dateFrom, dateTo);
      return { success: true, data: result };
    } catch (error) {
      console.error('Supplier Bill generatePreview error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.SUPPLIER_BILL_GET_NEXT_NUMBER, async () => {
    try {
      const result = queries.supplierBills.getNextBillNumber();
      return { success: true, data: result };
    } catch (error) {
      console.error('Supplier Bill getNextNumber error:', error);
      return { success: false, error: error.message };
    }
  });

  // Item handlers
  ipcMain.handle(channels.ITEM_GET_ALL, async () => {
    try {
      const result = queries.items.getAll();
      return { success: true, data: result };
    } catch (error) {
      console.error('Item getAll error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.ITEM_GET_BY_ID, async (event, id) => {
    try {
      const result = queries.items.getById(id);
      if (!result) {
        return { success: false, error: 'Item not found' };
      }
      return { success: true, data: result };
    } catch (error) {
      console.error('Item getById error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.ITEM_CREATE, async (event, data) => {
    try {
      // Check for duplicate name if provided
      if (data.name && queries.items.checkName(data.name)) {
        return { success: false, error: 'An item with this name already exists' };
      }
      const result = queries.items.create(data);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch (error) {
      console.error('Item create error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.ITEM_UPDATE, async (event, { id, data }) => {
    try {
      // Check for duplicate name if provided (excluding current item)
      if (data.name && queries.items.checkName(data.name, id)) {
        return { success: false, error: 'An item with this name already exists' };
      }
      queries.items.update(id, data);
      return { success: true };
    } catch (error) {
      console.error('Item update error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.ITEM_DELETE, async (event, id) => {
    try {
      // Check if item has transactions
      if (queries.items.hasTransactions(id)) {
        return {
          success: false,
          error: 'Cannot delete item with existing transactions. Consider deactivating instead.',
        };
      }
      queries.items.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Item delete error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.ITEM_SEARCH, async (event, name) => {
    try {
      const result = queries.items.search(name || '');
      return { success: true, data: result };
    } catch (error) {
      console.error('Item search error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(channels.ITEM_CHECK_NAME, async (event, { name, excludeId }) => {
    try {
      const exists = queries.items.checkName(name, excludeId);
      return { success: true, data: { exists } };
    } catch (error) {
      console.error('Item checkName error:', error);
      return { success: false, error: error.message };
    }
  });

  // App handlers
  ipcMain.handle(channels.APP_GET_VERSION, () => {
    return app.getVersion();
  });

  ipcMain.handle(channels.APP_GET_PLATFORM, () => {
    return process.platform;
  });

  ipcMain.handle(channels.APP_GET_PATH, (event, name) => {
    return app.getPath(name);
  });
}

module.exports = { registerHandlers };
