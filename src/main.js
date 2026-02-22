import { app, BrowserWindow } from 'electron';
import db from './database/index.js';
import { registerHandlers } from './ipc/handlers.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Detect if running in development mode
const isDev = !app.isPackaged;

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open DevTools only in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Initialize database
  try {
    db.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  // Register IPC handlers
  registerHandlers();
  console.log('IPC handlers registered');

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up database connection and jsreport on quit
app.on('before-quit', async () => {
  // Close jsreport (shuts down Puppeteer/Chromium)
  try {
    const jsreportService = (await import('./services/jsreportService.js')).default;
    await jsreportService.close();
  } catch {
    // jsreport may not have been initialized
  }
  db.close();
  console.log('Database connection closed');
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
