/**
 * jsreport Service
 * Renders HTML templates to PDF using jsreport-core + chrome-pdf recipe
 * Provides page numbers, headers/footers, and professional PDF output
 */

import jsreport from 'jsreport-core';
import chromePdf from '@jsreport/jsreport-chrome-pdf';
import handlebars from '@jsreport/jsreport-handlebars';

let jsreportInstance = null;

/**
 * Initialize jsreport engine (called once at app startup)
 */
async function init() {
    if (jsreportInstance) return jsreportInstance;

    jsreportInstance = jsreport({
        // Run in lightweight mode — no express server, no studio
        discover: false,
        // Use temp directory for jsreport work files  
        tempDirectory: undefined, // uses OS temp
        logger: {
            silent: true, // suppress jsreport internal logging
        },
    });

    // Register chrome-pdf recipe for HTML → PDF conversion
    jsreportInstance.use(chromePdf({
        launchOptions: {
            // Let puppeteer find its own bundled Chromium
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
    }));

    // Register Handlebars templating engine
    jsreportInstance.use(handlebars());

    await jsreportInstance.init();
    console.log('jsreport initialized');
    return jsreportInstance;
}

/**
 * Render HTML content to a PDF buffer
 * @param {string} htmlContent - Full HTML document string
 * @param {Object} options - PDF rendering options
 * @param {boolean} options.landscape - Landscape orientation (default: false)
 * @param {string} options.format - Page format (default: 'A4')
 * @param {boolean} options.displayHeaderFooter - Show header/footer (default: true)
 * @param {string} options.headerTemplate - Custom header HTML template
 * @param {string} options.footerTemplate - Custom footer HTML template
 * @param {string} options.marginTop - Top margin (default: '15mm')
 * @param {string} options.marginBottom - Bottom margin (default: '20mm')
 * @param {string} options.marginLeft - Left margin (default: '15mm')
 * @param {string} options.marginRight - Right margin (default: '15mm')
 * @returns {Promise<Buffer>} PDF data as buffer
 */
async function renderReport(htmlContent, options = {}) {
    const instance = await init();

    const {
        landscape = false,
        format = 'A4',
        displayHeaderFooter = true,
        headerTemplate = '<span></span>',
        footerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 9px; color: #888; padding: 5px 0;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `,
        marginTop = '15mm',
        marginBottom = '20mm',
        marginLeft = '15mm',
        marginRight = '15mm',
    } = options;

    const result = await instance.render({
        template: {
            content: htmlContent,
            engine: 'none', // HTML is already fully rendered, no templating needed
            recipe: 'chrome-pdf',
            chrome: {
                landscape,
                format,
                displayHeaderFooter,
                headerTemplate,
                footerTemplate,
                marginTop,
                marginBottom,
                marginLeft,
                marginRight,
                printBackground: true,
            },
        },
    });

    return result.content; // Buffer
}

/**
 * Shut down jsreport engine (called on app quit)
 */
async function close() {
    if (jsreportInstance) {
        await jsreportInstance.close();
        jsreportInstance = null;
        console.log('jsreport closed');
    }
}

export default {
    init,
    renderReport,
    close,
};
