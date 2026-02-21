/* global Buffer */
/**
 * PDF Generator Service
 * Uses pdfmake to generate professional PDF reports with RTL/Urdu support
 * Replaces Electron's printToPDF for report exports
 */

import PdfPrinterModule from 'pdfmake/js/Printer';
import path from 'path';

// Handle webpack default export interop
const PdfPrinter = PdfPrinterModule.default || PdfPrinterModule;

// Font definitions — resolve from project root (works with webpack)
const fontDir = path.join(process.cwd(), 'node_modules/pdfmake/build/fonts/Roboto');
const fonts = {
    Roboto: {
        normal: path.join(fontDir, 'Roboto-Regular.ttf'),
        bold: path.join(fontDir, 'Roboto-Medium.ttf'),
        italics: path.join(fontDir, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontDir, 'Roboto-MediumItalic.ttf'),
    },
};

const printer = new PdfPrinter(fonts);

// ——— Helper Functions ———

/**
 * Format a number as currency (e.g., "1,234.56")
 */
function formatNumber(num) {
    return (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Format a date string for display (e.g., "21-Feb-2026")
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ——— Report Layout Builders ———

/**
 * Company header content (Crystal Reports style — bold italic, left-aligned)
 */
function getCompanyHeader() {
    return [
        {
            text: 'AL - SHEIKH FISH TRADER AND DISTRIBUTER',
            style: 'companyName',
        },
        {
            text: 'Shop No. W-644 Gunj Mandi Rawalpindi',
            style: 'companyAddress',
        },
        {
            text: '+92-3008501724, 051-5534607',
            style: 'companyPhone',
        },
        {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }],
            margin: [0, 6, 0, 6],
        },
    ];
}

/**
 * Report title section (large title + optional small subtitle)
 */
function getReportTitle(titleUrdu, titleEn) {
    const content = [];
    if (titleUrdu) {
        content.push({
            text: titleUrdu,
            style: 'reportTitleUrdu',
            alignment: 'right',
        });
    }
    if (titleEn) {
        content.push({
            text: titleEn,
            style: 'reportTitleEn',
            alignment: 'right',
        });
    }
    return content;
}

/**
 * Date section — bordered box with date info
 */
function getDateSection(dateInfo) {
    if (!dateInfo) return [];

    let dateText;
    if (dateInfo.from && dateInfo.to) {
        dateText = `From: ${formatDate(dateInfo.from)}  To: ${formatDate(dateInfo.to)}`;
    } else if (dateInfo.single) {
        dateText = `Date: ${formatDate(dateInfo.single)}`;
    } else {
        return [];
    }

    return [
        {
            table: {
                widths: ['*'],
                body: [[{ text: dateText, alignment: 'center', fontSize: 11, margin: [0, 3, 0, 3] }]],
            },
            margin: [0, 8, 0, 12],
        },
    ];
}

// ——— Default Styles ———

const defaultStyles = {
    companyName: {
        fontSize: 18,
        bold: true,
        italics: true,
        margin: [0, 0, 0, 2],
    },
    companyAddress: {
        fontSize: 10,
        italics: true,
        color: '#333',
        margin: [0, 0, 0, 1],
    },
    companyPhone: {
        fontSize: 10,
        italics: true,
        color: '#333',
        margin: [0, 0, 0, 0],
    },
    reportTitleUrdu: {
        fontSize: 20,
        bold: true,
        margin: [0, 0, 0, 2],
    },
    reportTitleEn: {
        fontSize: 9,
        color: '#666',
        margin: [0, 0, 0, 4],
    },
    tableHeader: {
        bold: true,
        fontSize: 10,
        fillColor: '#e8e8e8',
    },
    tableCell: {
        fontSize: 10,
    },
    summaryLabel: {
        bold: true,
        fontSize: 11,
    },
    summaryValue: {
        fontSize: 11,
        alignment: 'right',
    },
    sectionTitle: {
        bold: true,
        fontSize: 13,
        margin: [0, 10, 0, 6],
    },
};

const defaultTableLayout = {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => '#000',
    vLineColor: () => '#000',
    paddingLeft: () => 6,
    paddingRight: () => 6,
    paddingTop: () => 4,
    paddingBottom: () => 4,
};

// ——— PDF Generation ———

/**
 * Generate a PDF buffer from a pdfmake document definition
 * @param {Object} docDefinition - pdfmake document definition
 * @returns {Promise<Buffer>} PDF data as buffer
 */
async function generatePDF(docDefinition) {
    // Merge default styles with any custom ones
    const mergedDoc = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 50],
        footer: (currentPage, pageCount) => ({
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'center',
            fontSize: 9,
            color: '#888',
            margin: [0, 10, 0, 0],
        }),
        ...docDefinition,
        styles: {
            ...defaultStyles,
            ...(docDefinition.styles || {}),
        },
        defaultStyle: {
            font: 'Roboto',
            fontSize: 10,
            ...(docDefinition.defaultStyle || {}),
        },
    };

    // createPdfKitDocument is async in pdfmake v0.3.4+
    const pdfDoc = await printer.createPdfKitDocument(mergedDoc);

    return new Promise((resolve, reject) => {
        const chunks = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', (err) => reject(err));
        pdfDoc.end();
    });
}

/**
 * Build a complete report document definition with standard layout
 * @param {Object} options - Report options
 * @param {string} options.titleUrdu - Urdu report title
 * @param {string} options.titleEn - English report title
 * @param {Object} options.dateInfo - Date info { from, to } or { single }
 * @param {Array} options.content - Main report content (pdfmake content array)
 * @param {boolean} options.landscape - Whether to use landscape orientation
 * @returns {Object} Complete pdfmake document definition
 */
function buildReportDoc({ titleUrdu, titleEn, dateInfo, content = [], landscape = false }) {
    const docContent = [
        ...getCompanyHeader(),
        ...getReportTitle(titleUrdu, titleEn),
        ...getDateSection(dateInfo),
        ...content,
    ];

    return {
        pageSize: 'A4',
        pageOrientation: landscape ? 'landscape' : 'portrait',
        content: docContent,
    };
}

export default {
    generatePDF,
    buildReportDoc,
    getCompanyHeader,
    getReportTitle,
    getDateSection,
    formatNumber,
    formatDate,
    defaultStyles,
    defaultTableLayout,
};
