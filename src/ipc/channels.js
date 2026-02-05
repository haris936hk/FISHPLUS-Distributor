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

  // App channels
  APP_GET_VERSION: 'app:getVersion',
  APP_GET_PLATFORM: 'app:getPlatform',
  APP_GET_PATH: 'app:getPath',

  // Events (main -> renderer)
  DB_UPDATED: 'db:updated',
};
