/* global setTimeout */
/**
 * Print Service
 * Handles printing and exporting reports to PDF/Excel
 * Implements FR-PRINT-001 through FR-PRINT-012
 */

import electron from 'electron';
const { BrowserWindow, dialog, app } = electron;
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import jsreportService from './jsreportService.js';

/**
 * Print HTML content using a hidden browser window
 * @param {BrowserWindow} mainWindow - Main application window
 * @param {string} htmlContent - HTML content to print
 * @param {Object} options - Print options
 * @returns {Promise<boolean>} Success status
 */
async function printReport(mainWindow, htmlContent, options = {}) {
  const {
    silent = false,
    printBackground = true,
    landscape = false,
    margins = { marginType: 'default' },
  } = options;

  // Create a hidden window for printing
  const printWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  try {
    // Load the HTML content
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Wait for content to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Print the content
    const printSuccess = await printWindow.webContents.print({
      silent,
      printBackground,
      landscape,
      ...margins,
    });

    return printSuccess;
  } catch (error) {
    console.error('Print error:', error);
    throw error;
  } finally {
    printWindow.destroy();
  }
}

/**
 * Export content to PDF file
 * @param {BrowserWindow} mainWindow - Main application window
 * @param {string} htmlContent - HTML content to export
 * @param {Object} options - PDF options
 * @returns {Promise<string>} Path to saved PDF file
 */
async function exportToPDF(mainWindow, htmlContent, options = {}) {
  const {
    filename = 'report.pdf',
    landscape = false,
  } = options;

  // Show save dialog
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export to PDF',
    defaultPath: path.join(app.getPath('documents'), filename),
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) {
    return null;
  }

  try {
    // Render PDF using jsreport (chrome-pdf recipe)
    const pdfBuffer = await jsreportService.renderReport(htmlContent, {
      landscape,
      format: 'A4',
      displayHeaderFooter: true,
      marginTop: '15mm',
      marginBottom: '20mm',
      marginLeft: '15mm',
      marginRight: '15mm',
    });

    // Save to file
    fs.writeFileSync(filePath, pdfBuffer);

    return filePath;
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}

/**
 * Export data to Excel (.xlsx) file using exceljs
 * @param {BrowserWindow} mainWindow - Main application window
 * @param {Array<Object>} data - Data to export
 * @param {Object} options - Export options
 * @returns {Promise<string>} Path to saved file
 */
async function exportToExcel(mainWindow, data, options = {}) {
  const {
    filename = 'export.xlsx',
    columns = null,
    sheetName = 'Data',
    title = '',
    titleUrdu = '',
    dateRange = null,
  } = options;

  // Show save dialog
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export to Excel',
    defaultPath: path.join(app.getPath('documents'), filename),
    filters: [
      { name: 'Excel Files', extensions: ['xlsx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (canceled || !filePath) {
    return null;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FISHPLUS-Distributor';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName, {
      properties: { defaultRowHeight: 20 },
    });

    // Add company header
    let currentRow = 1;

    // Company name
    worksheet.mergeCells(
      `A${currentRow}:${String.fromCharCode(64 + (columns?.length || Object.keys(data[0] || {}).length))}${currentRow}`
    );
    const companyCell = worksheet.getCell(`A${currentRow}`);
    companyCell.value = 'AL-SHEIKH FISH TRADER';
    companyCell.font = { bold: true, size: 16 };
    companyCell.alignment = { horizontal: 'center' };
    currentRow++;

    // Company name in Urdu
    worksheet.mergeCells(
      `A${currentRow}:${String.fromCharCode(64 + (columns?.length || Object.keys(data[0] || {}).length))}${currentRow}`
    );
    const companyUrduCell = worksheet.getCell(`A${currentRow}`);
    companyUrduCell.value = 'الشیخ فش ٹریڈر';
    companyUrduCell.font = { bold: true, size: 14 };
    companyUrduCell.alignment = { horizontal: 'center' };
    currentRow++;

    // Report title
    if (title) {
      worksheet.mergeCells(
        `A${currentRow}:${String.fromCharCode(64 + (columns?.length || Object.keys(data[0] || {}).length))}${currentRow}`
      );
      const titleCell = worksheet.getCell(`A${currentRow}`);
      titleCell.value = title + (titleUrdu ? ` / ${titleUrdu}` : '');
      titleCell.font = { bold: true, size: 12 };
      titleCell.alignment = { horizontal: 'center' };
      currentRow++;
    }

    // Date range
    if (dateRange) {
      worksheet.mergeCells(
        `A${currentRow}:${String.fromCharCode(64 + (columns?.length || Object.keys(data[0] || {}).length))}${currentRow}`
      );
      const dateCell = worksheet.getCell(`A${currentRow}`);
      dateCell.value = `From: ${dateRange.from} To: ${dateRange.to}`;
      dateCell.alignment = { horizontal: 'center' };
      currentRow++;
    }

    currentRow++; // Empty row

    // Determine columns
    const cols =
      columns || (data.length > 0 ? Object.keys(data[0]).map((key) => ({ key, label: key })) : []);

    // Set columns
    worksheet.columns = cols.map((col) => ({
      header: col.label || col.key,
      key: col.key,
      width: col.width || 15,
    }));

    // Style header row
    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = cols.map((col) => col.label || col.key);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    headerRow.border = {
      bottom: { style: 'thin' },
    };
    currentRow++;

    // Add data rows
    for (const row of data) {
      const dataRow = worksheet.getRow(currentRow);
      cols.forEach((col, index) => {
        dataRow.getCell(index + 1).value = row[col.key] ?? '';
      });
      currentRow++;
    }

    // Auto-fit columns (approximate)
    worksheet.columns.forEach((column) => {
      let maxLength = column.header?.length || 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const length = cell.value?.toString().length || 0;
        if (length > maxLength) maxLength = length;
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Save workbook
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  } catch (error) {
    console.error('Excel export error:', error);
    throw error;
  }
}

/**
 * Generate CSV content from data array
 * @param {Array<Object>} data - Data array
 * @param {Array<{key: string, label: string}>} columns - Column definitions
 * @returns {string} CSV content
 */
function generateCSV(data, columns = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // If columns not specified, use keys from first row
  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }));

  // Generate header row
  const headers = cols.map((col) => escapeCSVValue(col.label || col.key));
  const rows = [headers.join(',')];

  // Generate data rows
  for (const row of data) {
    const values = cols.map((col) => {
      const value = row[col.key];
      return escapeCSVValue(value);
    });
    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Escape value for CSV (handles commas, quotes, newlines)
 * @param {*} value - Value to escape
 * @returns {string} Escaped CSV value
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generate company header HTML for reports
 * @returns {string} Company header HTML
 */
function getCompanyHeaderHTML() {
  return `
    <div style="text-align: left; margin-bottom: 8px; direction: ltr;">
      <p style="margin: 0; font-size: 22px; font-weight: bold; font-style: italic; letter-spacing: 0.5px;">AL - SHEIKH FISH TRADER AND DISTRIBUTER</p>
      <p style="margin: 2px 0; font-size: 12px; font-style: italic; color: #222;">Shop No. W-644 Gunj Mandi Rawalpindi</p>
      <p style="margin: 2px 0 0; font-size: 12px; font-style: italic; color: #222;">+92-3008501724, 051-5534607</p>
    </div>
  `;
}

/**
 * Wrap content with print-ready HTML structure
 * @param {string} bodyContent - Body content
 * @param {Object} options - Options
 * @returns {string} Complete HTML document
 */
function wrapInPrintHTML(bodyContent, options = {}) {
  const { title = 'Report', includeHeader = true, direction = 'rtl' } = options;

  const header = includeHeader ? getCompanyHeaderHTML() : '';

  return `
    <!DOCTYPE html>
    <html dir="${direction}">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm 15mm 20mm 15mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 13px;
          line-height: 1.5;
          color: #000;
          direction: ${direction};
          margin: 0;
          padding: 20px 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        th, td {
          border: 1px solid #000;
          padding: 6px 10px;
          text-align: ${direction === 'rtl' ? 'right' : 'left'};
          font-size: 12px;
          vertical-align: middle;
        }
        th {
          background-color: #e8e8e8;
          font-weight: bold;
        }
        .total-row {
          font-weight: bold;
          background-color: #f0f0f0 !important;
        }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .text-center { text-align: center; }

        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${header}
      ${bodyContent}
    </body>
    </html>
  `;
}

/**
 * Open a print preview window with Print/Cancel controls
 * @param {BrowserWindow} mainWindow - Main application window
 * @param {string} htmlContent - HTML content to preview
 * @param {Object} options - Preview options
 * @returns {Promise<void>}
 */
async function printPreview(mainWindow, htmlContent, options = {}) {
  const { width = 800, height = 600, title = 'Print Preview' } = options;

  const previewWindow = new BrowserWindow({
    parent: mainWindow,
    width,
    height,
    title,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Add print/cancel buttons at the top of the HTML (using a fixed header)
  const htmlWithControls = htmlContent.replace(
    '</body>',
    `<div style="position:fixed;top:0;left:0;right:0;background:#f8f9fa;padding:12px 20px;border-bottom:1px solid #dee2e6;z-index:9999;text-align:right;box-shadow: 0 2px 4px rgba(0,0,0,0.1);" class="no-print">
      <span style="float:left;font-weight:bold;font-size:16px;margin-top:6px;color:#333;">🖨️ Print Preview</span>
      <button onclick="window.print()" style="padding:8px 24px;margin-right:10px;cursor:pointer;background:#228be6;color:white;border:none;border-radius:4px;font-weight:600;font-size:14px;box-shadow:0 1px 3px rgba(0,0,0,0.2);">Print</button>
      <button onclick="window.close()" style="padding:8px 24px;cursor:pointer;background:#868e96;color:white;border:none;border-radius:4px;font-weight:600;font-size:14px;box-shadow:0 1px 3px rgba(0,0,0,0.2);">Close</button>
    </div>
    <style>@media print { .no-print { display: none !important; } body { padding-top: 0 !important; } }</style>
    <div style="height:60px;"></div>
    </body>`
  );

  try {
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlWithControls)}`;
    await previewWindow.loadURL(dataUrl);
    previewWindow.show();
  } catch (error) {
    console.error('Print preview error:', error);
    if (!previewWindow.isDestroyed()) {
      previewWindow.destroy();
    }
    throw error;
  }
}



export default {
  printReport,
  printPreview,
  exportToPDF,
  exportToExcel,
  generateCSV,
  escapeCSVValue,
  getCompanyHeaderHTML,
  wrapInPrintHTML,
};
