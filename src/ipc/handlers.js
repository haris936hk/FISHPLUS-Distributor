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
