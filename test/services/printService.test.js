import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import printService from '../../src/services/printService.js';
import { BrowserWindow, dialog } from 'electron';
import fs from 'fs';
import { Buffer } from 'node:buffer';
import ExcelJS from 'exceljs';

// Mock dependencies
vi.mock('fs', () => {
  const writeFileSync = vi.fn();
  const readFileSync = vi.fn();
  return {
    default: {
      writeFileSync,
      readFileSync,
    },
    writeFileSync,
    readFileSync,
  };
});
vi.mock('exceljs');

// Explicit mock for electron to ensure BrowserWindow is a Mock
vi.mock('electron', () => {
  const handle = vi.fn();
  const invoke = vi.fn();
  const on = vi.fn();
  const removeListener = vi.fn();
  const getVersion = vi.fn(() => '1.0.0');
  const getPath = vi.fn(() => '/mock/path');
  const showSaveDialog = vi.fn();
  const exposeInMainWorld = vi.fn();

  const BrowserWindow = vi.fn(function () {
    return {
      loadURL: vi.fn(),
      webContents: {
        print: vi.fn(),
        printToPDF: vi.fn(),
      },
      on: vi.fn(),
      destroy: vi.fn(),
      show: vi.fn(),
      isDestroyed: vi.fn(() => false),
    };
  });
  BrowserWindow.getAllWindows = vi.fn(() => []);
  BrowserWindow.getFocusedWindow = vi.fn(() => ({}));

  const mockElectron = {
    ipcMain: { handle },
    ipcRenderer: { invoke, on, removeListener },
    app: { getVersion, getPath },
    dialog: { showSaveDialog },
    BrowserWindow,
    contextBridge: { exposeInMainWorld },
  };
  return {
    ...mockElectron,
    default: mockElectron,
  };
});

describe('Print Service', () => {
  let mockWindow;
  let mockWebContents;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWebContents = {
      print: vi.fn().mockResolvedValue(true),
      printToPDF: vi.fn().mockResolvedValue(Buffer.from('pdf-data')),
    };

    mockWindow = {
      loadURL: vi.fn().mockResolvedValue(),
      destroy: vi.fn(),
      webContents: mockWebContents,
      show: vi.fn(),
      isDestroyed: vi.fn(() => false),
    };

    // For manual mock, BrowserWindow is a vite fn.
    BrowserWindow.mockImplementation(function () {
      return mockWindow;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('printReport', () => {
    it('creates a hidden window and prints', async () => {
      const html = '<h1>Test</h1>';
      const result = await printService.printReport(null, html);

      expect(BrowserWindow).toHaveBeenCalledWith(expect.objectContaining({ show: false }));
      expect(mockWindow.loadURL).toHaveBeenCalledWith(expect.stringContaining('data:text/html'));
      expect(mockWebContents.print).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(mockWindow.destroy).toHaveBeenCalled();
    });

    it('handles print errors', async () => {
      mockWebContents.print.mockRejectedValue(new Error('Print failed'));

      await expect(printService.printReport(null, 'html')).rejects.toThrow('Print failed');
      expect(mockWindow.destroy).toHaveBeenCalled();
    });
  });

  describe('exportToPDF', () => {
    it('saves PDF to file', async () => {
      dialog.showSaveDialog.mockResolvedValue({ filePath: '/path/to/file.pdf', canceled: false });

      const result = await printService.exportToPDF(null, 'html');

      expect(dialog.showSaveDialog).toHaveBeenCalled();
      expect(mockWebContents.printToPDF).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith('/path/to/file.pdf', expect.anything());
      expect(result).toBe('/path/to/file.pdf');
    });

    it('returns null if cancelled', async () => {
      dialog.showSaveDialog.mockResolvedValue({ canceled: true });

      const result = await printService.exportToPDF(null, 'html');

      expect(result).toBeNull();
      expect(mockWebContents.printToPDF).not.toHaveBeenCalled();
    });
  });

  describe('generateCSV', () => {
    it('generates CSV string from data', () => {
      const data = [
        { name: 'A', value: 1 },
        { name: 'B', value: 2 },
      ];
      const csv = printService.generateCSV(data);

      expect(csv).toContain('name,value');
      expect(csv).toContain('A,1');
      expect(csv).toContain('B,2');
    });

    it('escapes values correctly', () => {
      const data = [{ name: 'A,B', value: 'Test "Quote"' }];
      const csv = printService.generateCSV(data);

      expect(csv).toContain('"A,B"');
      expect(csv).toContain('"Test ""Quote"""');
    });
  });

  describe('exportToExcel', () => {
    it('creates and saves workbook', async () => {
      dialog.showSaveDialog.mockResolvedValue({ filePath: '/file.xlsx', canceled: false });

      const mockWorksheet = {
        mergeCells: vi.fn(),
        getCell: vi.fn().mockReturnValue({ value: '', font: {}, alignment: {} }),
        getRow: vi.fn().mockReturnValue({
          values: [],
          font: {},
          fill: {},
          border: {},
          getCell: vi.fn().mockReturnValue({}),
        }),
        addRows: vi.fn(),
      };

      // Mock columns setter to add eachCell method (simulating ExcelJS behavior)
      let columns = [];
      Object.defineProperty(mockWorksheet, 'columns', {
        get: () => columns,
        set: (cols) => {
          columns = cols.map((c) => ({
            ...c,
            eachCell: vi.fn(),
          }));
        },
      });

      const mockWorkbook = {
        creator: '',
        created: new Date(),
        addWorksheet: vi.fn().mockReturnValue(mockWorksheet),
        xlsx: {
          writeFile: vi.fn().mockResolvedValue(),
        },
      };

      ExcelJS.Workbook.mockImplementation(function () {
        return mockWorkbook;
      });

      const data = [{ id: 1, name: 'Test' }];
      await printService.exportToExcel(null, data);

      expect(dialog.showSaveDialog).toHaveBeenCalled();
      expect(ExcelJS.Workbook).toHaveBeenCalled();
      expect(mockWorkbook.addWorksheet).toHaveBeenCalled();
      expect(mockWorkbook.xlsx.writeFile).toHaveBeenCalledWith('/file.xlsx');
    });
  });

  describe('printPreview', () => {
    it.skip('creates a window and loads content with controls', async () => {
      const html = '<h1>Preview</h1>';

      // Create a specific mock instance for this test
      const mockPreviewWindow = {
        loadURL: vi.fn().mockResolvedValue(),
        show: vi.fn(),
        isDestroyed: vi.fn(() => false),
        destroy: vi.fn(),
        on: vi.fn(),
        webContents: {
          print: vi.fn().mockResolvedValue(true),
          printToPDF: vi.fn().mockResolvedValue(Buffer.from('pdf')),
        },
      };

      // Use vi.mocked to set implementation
      vi.mocked(BrowserWindow).mockImplementation(function () {
        return mockPreviewWindow;
      });

      await printService.printPreview(mockWindow, html);

      // Verify new window creation (check title only to avoid complex object equality issues with parent)
      expect(BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Print Preview',
        })
      );

      // Verify content loading with injected controls
      expect(mockPreviewWindow.loadURL).toHaveBeenCalledWith(
        expect.stringContaining('Print Preview')
      );
      expect(mockPreviewWindow.show).toHaveBeenCalled();
    });
  });

  describe('wrapInPrintHTML', () => {
    it('wraps content with header and styles', () => {
      const content = '<p>Body</p>';
      const result = printService.wrapInPrintHTML(content, { title: 'Test Report' });

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<title>Test Report</title>');
      expect(result).toContain('AL - SHEIKH FISH TRADER AND DISTRIBUTER'); // Header check
      expect(result).toContain(content);
    });
  });
});
