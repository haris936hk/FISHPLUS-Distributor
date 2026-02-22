// filepath: test/ipc/preload.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Preload Script', () => {
  let api;
  let contextBridge;
  let ipcRenderer;
  let channels;

  beforeEach(async () => {
    vi.resetModules();
    // Use manual mock from __mocks__/electron.js
    vi.mock('electron');

    // Import mocked electron to get spies
    const electron = await import('electron');
    contextBridge = electron.contextBridge;
    ipcRenderer = electron.ipcRenderer;

    // Import channels
    const channelsModule = await import('../../src/ipc/channels');
    channels = channelsModule.default || channelsModule;

    // Import preload to trigger execution
    await import('../../src/preload');

    // Capture api
    // contextBridge.exposeInMainWorld should have been called
    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('api', expect.any(Object));
    // Reset calls so we don't count the setup call in assertions if needed,
    // but we need the args.
    api = contextBridge.exposeInMainWorld.mock.calls[0][1];

    // Clear mocks history so subsequent calls in tests are fresh
    // But we just captured api from the call.
    contextBridge.exposeInMainWorld.mockClear();
    ipcRenderer.invoke.mockClear();
    ipcRenderer.on.mockClear();
    ipcRenderer.removeListener.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Settings API', () => {
    it('getAll invokes correct channel', () => {
      api.settings.getAll();
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channels.SETTINGS_GET_ALL);
    });

    it('save invokes correct channel with args', () => {
      api.settings.save('key', 'value');
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channels.SETTINGS_SAVE_ONE, {
        key: 'key',
        value: 'value',
      });
    });
  });

  describe('Dashboard API', () => {
    it('getSummary invokes correct channel', () => {
      api.dashboard.getSummary();
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channels.DASHBOARD_GET_SUMMARY);
    });
  });

  describe('Supplier API', () => {
    it('getAll invokes correct channel', () => {
      api.suppliers.getAll();
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channels.SUPPLIER_GET_ALL);
    });

    it('create invokes correct channel with data', () => {
      const data = { name: 'Test' };
      api.suppliers.create(data);
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channels.SUPPLIER_CREATE, data);
    });
  });

  describe('Customer API', () => {
    it('search invokes correct channel', () => {
      api.customers.search('query');
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channels.CUSTOMER_SEARCH, 'query');
    });
  });

  describe('Sale API', () => {
    it('create invokes correct channel', () => {
      const sale = { items: [] };
      api.sales.create(sale);
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channels.SALE_CREATE, sale);
    });
  });

  describe('App API', () => {
    it('getVersion invokes correct channel', () => {
      api.app.getVersion();
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channels.APP_GET_VERSION);
    });
  });

  describe('Event Listeners', () => {
    it('on registers listener for whitelisted channel', () => {
      const callback = vi.fn();
      api.on(channels.DB_UPDATED, callback);
      expect(ipcRenderer.on).toHaveBeenCalledWith(channels.DB_UPDATED, expect.any(Function));
    });

    it('on does not register listener for non-whitelisted channel', () => {
      const callback = vi.fn();
      api.on('unknown-channel', callback);
      expect(ipcRenderer.on).not.toHaveBeenCalled();
    });

    it('off removes listener', () => {
      const callback = vi.fn();
      api.off(channels.DB_UPDATED, callback);
      expect(ipcRenderer.removeListener).toHaveBeenCalledWith(channels.DB_UPDATED, callback);
    });
  });
});
