// IPC Channel Definitions
// This file centralizes all IPC channel names to prevent typos and ensure consistency

module.exports = {
  // Domain-specific channels
  SETTINGS_GET_ALL: 'settings:getAll',
  SETTINGS_SAVE_ONE: 'settings:saveOne',

  // Dashboard channels
  DASHBOARD_GET_SUPPLIER_ADVANCES: 'dashboard:getSupplierAdvances',
  DASHBOARD_GET_ITEMS_STOCK: 'dashboard:getItemsStock',
  DASHBOARD_GET_SUMMARY: 'dashboard:getSummary',

  // Supplier channels
  SUPPLIER_GET_ALL: 'supplier:getAll',
  SUPPLIER_GET_BY_ID: 'supplier:getById',
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_UPDATE: 'supplier:update',
  SUPPLIER_DELETE: 'supplier:delete',
  SUPPLIER_SEARCH: 'supplier:search',
  SUPPLIER_CHECK_NIC: 'supplier:checkNic',

  // Customer channels
  CUSTOMER_GET_ALL: 'customer:getAll',
  CUSTOMER_GET_BY_ID: 'customer:getById',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',
  CUSTOMER_SEARCH: 'customer:search',
  CUSTOMER_CHECK_NIC: 'customer:checkNic',

  // Supplier Bill channels
  SUPPLIER_BILL_GET_ALL: 'supplierBill:getAll',
  SUPPLIER_BILL_GET_BY_ID: 'supplierBill:getById',
  SUPPLIER_BILL_CREATE: 'supplierBill:create',
  SUPPLIER_BILL_UPDATE: 'supplierBill:update',
  SUPPLIER_BILL_DELETE: 'supplierBill:delete',
  SUPPLIER_BILL_GENERATE_PREVIEW: 'supplierBill:generatePreview',
  SUPPLIER_BILL_GET_NEXT_NUMBER: 'supplierBill:getNextNumber',

  // Item channels
  ITEM_GET_ALL: 'item:getAll',
  ITEM_GET_BY_ID: 'item:getById',
  ITEM_CREATE: 'item:create',
  ITEM_UPDATE: 'item:update',
  ITEM_DELETE: 'item:delete',
  ITEM_SEARCH: 'item:search',
  ITEM_CHECK_NAME: 'item:checkName',

  // Reference data channels
  REFERENCE_GET_CITIES: 'reference:getCities',
  REFERENCE_GET_COUNTRIES: 'reference:getCountries',
  REFERENCE_GET_CATEGORIES: 'reference:getCategories',

  // App channels
  APP_GET_VERSION: 'app:getVersion',
  APP_GET_PLATFORM: 'app:getPlatform',
  APP_GET_PATH: 'app:getPath',

  // Events (main -> renderer)
  DB_UPDATED: 'db:updated',
};
