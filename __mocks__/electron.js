// filepath: __mocks__/electron.js
// global vi is available
// const { vi } = require('vitest');

// Create mock functions
const handle = vi.fn();
const invoke = vi.fn();
const on = vi.fn();
const removeListener = vi.fn();
const getVersion = vi.fn(() => '1.0.0');
const getPath = vi.fn(() => '/mock/path');
const showSaveDialog = vi.fn();
const exposeInMainWorld = vi.fn();

// Mock objects
const ipcMain = { handle };
const ipcRenderer = { invoke, on, removeListener };
const app = { getVersion, getPath };
const dialog = { showSaveDialog };
const contextBridge = { exposeInMainWorld };

// BrowserWindow mock needs to be a class-like function
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
}));
// Export named exports for ESM
export {
    ipcMain,
    ipcRenderer,
    app,
    dialog,
    BrowserWindow,
    contextBridge,
};

// Default export
export default {
    ipcMain,
    ipcRenderer,
    app,
    dialog,
    BrowserWindow,
    contextBridge,
};
