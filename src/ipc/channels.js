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

  // Reference data channels
  REFERENCE_GET_CITIES: 'reference:getCities',
  REFERENCE_GET_COUNTRIES: 'reference:getCountries',

  // App channels
  APP_GET_VERSION: 'app:getVersion',
  APP_GET_PLATFORM: 'app:getPlatform',
  APP_GET_PATH: 'app:getPath',

  // Events (main -> renderer)
  DB_UPDATED: 'db:updated',
};
