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
