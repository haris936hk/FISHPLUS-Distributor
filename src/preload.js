// Preload script - secure bridge between main and renderer
// See: https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');
const channels = require('./ipc/channels');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Database operations
  // Domain-specific APIs
  settings: {
    getAll: () => ipcRenderer.invoke(channels.SETTINGS_GET_ALL),
    save: (key, value) => ipcRenderer.invoke(channels.SETTINGS_SAVE_ONE, { key, value }),
  },

  // Dashboard APIs
  dashboard: {
    getSupplierAdvances: () => ipcRenderer.invoke(channels.DASHBOARD_GET_SUPPLIER_ADVANCES),
    getItemsStock: () => ipcRenderer.invoke(channels.DASHBOARD_GET_ITEMS_STOCK),
    getSummary: () => ipcRenderer.invoke(channels.DASHBOARD_GET_SUMMARY),
  },

  // Supplier APIs
  suppliers: {
    getAll: () => ipcRenderer.invoke(channels.SUPPLIER_GET_ALL),
    getById: (id) => ipcRenderer.invoke(channels.SUPPLIER_GET_BY_ID, id),
    create: (data) => ipcRenderer.invoke(channels.SUPPLIER_CREATE, data),
    update: (id, data) => ipcRenderer.invoke(channels.SUPPLIER_UPDATE, { id, data }),
    delete: (id) => ipcRenderer.invoke(channels.SUPPLIER_DELETE, id),
    search: (name) => ipcRenderer.invoke(channels.SUPPLIER_SEARCH, name),
    checkNic: (nic, excludeId) =>
      ipcRenderer.invoke(channels.SUPPLIER_CHECK_NIC, { nic, excludeId }),
  },

  // Customer APIs
  customers: {
    getAll: () => ipcRenderer.invoke(channels.CUSTOMER_GET_ALL),
    getById: (id) => ipcRenderer.invoke(channels.CUSTOMER_GET_BY_ID, id),
    create: (data) => ipcRenderer.invoke(channels.CUSTOMER_CREATE, data),
    update: (id, data) => ipcRenderer.invoke(channels.CUSTOMER_UPDATE, { id, data }),
    delete: (id) => ipcRenderer.invoke(channels.CUSTOMER_DELETE, id),
    search: (name) => ipcRenderer.invoke(channels.CUSTOMER_SEARCH, name),
    checkNic: (nic, excludeId) =>
      ipcRenderer.invoke(channels.CUSTOMER_CHECK_NIC, { nic, excludeId }),
  },

  // Supplier Bill APIs
  supplierBills: {
    getAll: () => ipcRenderer.invoke(channels.SUPPLIER_BILL_GET_ALL),
    getById: (id) => ipcRenderer.invoke(channels.SUPPLIER_BILL_GET_BY_ID, id),
    create: (data) => ipcRenderer.invoke(channels.SUPPLIER_BILL_CREATE, data),
    update: (id, data) => ipcRenderer.invoke(channels.SUPPLIER_BILL_UPDATE, { id, data }),
    delete: (id) => ipcRenderer.invoke(channels.SUPPLIER_BILL_DELETE, id),
    generatePreview: (supplierId, dateFrom, dateTo) =>
      ipcRenderer.invoke(channels.SUPPLIER_BILL_GENERATE_PREVIEW, { supplierId, dateFrom, dateTo }),
    getNextNumber: () => ipcRenderer.invoke(channels.SUPPLIER_BILL_GET_NEXT_NUMBER),
  },

  // Item APIs
  items: {
    getAll: () => ipcRenderer.invoke(channels.ITEM_GET_ALL),
    getById: (id) => ipcRenderer.invoke(channels.ITEM_GET_BY_ID, id),
    create: (data) => ipcRenderer.invoke(channels.ITEM_CREATE, data),
    update: (id, data) => ipcRenderer.invoke(channels.ITEM_UPDATE, { id, data }),
    delete: (id) => ipcRenderer.invoke(channels.ITEM_DELETE, id),
    search: (name) => ipcRenderer.invoke(channels.ITEM_SEARCH, name),
    checkName: (name, excludeId) =>
      ipcRenderer.invoke(channels.ITEM_CHECK_NAME, { name, excludeId }),
  },

  // Reference data APIs
  reference: {
    getCities: () => ipcRenderer.invoke(channels.REFERENCE_GET_CITIES),
    getCountries: () => ipcRenderer.invoke(channels.REFERENCE_GET_COUNTRIES),
    getCategories: () => ipcRenderer.invoke(channels.REFERENCE_GET_CATEGORIES),
  },

  // App utilities
  app: {
    getVersion: () => ipcRenderer.invoke(channels.APP_GET_VERSION),
    getPlatform: () => ipcRenderer.invoke(channels.APP_GET_PLATFORM),
    getPath: (name) => ipcRenderer.invoke(channels.APP_GET_PATH, name),
  },

  // Event listeners (main -> renderer)
  on: (channel, callback) => {
    // Whitelist channels to prevent security issues
    const validChannels = [channels.DB_UPDATED];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  // Remove event listeners
  off: (channel, callback) => {
    const validChannels = [channels.DB_UPDATED];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
});
