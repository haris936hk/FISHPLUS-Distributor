import { useRef, useState } from 'react';
import { Paper, Stack, Group, Title, Text, Button, Divider, Menu } from '@mantine/core';
import {
  IconPrinter,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconChevronDown,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';

/**
 * ReportViewer - Shared report viewer component with print and export functionality
 * Provides company header, print button, and PDF/CSV export for all reports
 * Implements FR-PRINT-001 through FR-PRINT-012
 */
export function ReportViewer({
  title,
  titleUrdu = '',
  dateRange = null,
  singleDate = null,
  children,
  exportData = null, // Optional: Array of objects for CSV export
  exportColumns = null, // Optional: Column definitions for CSV export
}) {
  const printRef = useRef();
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const generatePrintHTML = () => {
    const content = printRef.current;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page {
              margin: 1cm 1cm 1.5cm 1cm;
              @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 10px;
                color: #666;
              }
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin: 0;
            }
            .company-name-urdu { 
              font-size: 22px; 
              font-weight: bold; 
              margin: 5px 0;
              direction: rtl;
            }
            .company-address { 
              font-size: 12px; 
              margin: 5px 0;
            }
            .report-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin: 15px 0 5px;
            }
            .report-title-urdu { 
              font-size: 16px; 
              direction: rtl;
            }
            .date-range { 
              font-size: 12px; 
              margin: 10px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px;
            }
            th, td { 
              border: 1px solid #333; 
              padding: 8px; 
              text-align: left;
              font-size: 12px;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .rtl { direction: rtl; text-align: right; }
            .total-row { 
              font-weight: bold; 
              background-color: #f5f5f5;
            }
            .summary-section {
              margin-top: 20px;
              padding: 15px;
              border: 1px solid #333;
            }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <p class="company-name">AL-SHEIKH FISH TRADER</p>
            <p class="company-name-urdu">الشیخ فش ٹریڈر</p>
            <p class="company-address">Fish Market, Karachi | Ph: 0300-1234567</p>
            <p class="report-title">${title}</p>
            ${titleUrdu ? `<p class="report-title-urdu">${titleUrdu}</p>` : ''}
            ${dateRange ? `<p class="date-range">From: ${dateRange.from} To: ${dateRange.to}</p>` : ''}
            ${singleDate ? `<p class="date-range">Date: ${singleDate}</p>` : ''}
          </div>
          ${content.innerHTML}
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const htmlContent = generatePrintHTML();
    const printWindow = window.open('', '_blank');

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleExportPDF = async () => {
    try {
      const htmlContent = generatePrintHTML();
      const response = await window.api.print.exportPDF(htmlContent, {
        filename: `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        landscape: false,
      });

      if (response.success) {
        notifications.show({
          title: 'Export Successful',
          message: `PDF saved to: ${response.data.filePath}`,
          color: 'green',
        });
      } else {
        if (response.error !== 'Export cancelled') {
          notifications.show({
            title: 'Export Failed',
            message: response.error,
            color: 'red',
          });
        }
      }
    } catch (error) {
      console.error('PDF export error:', error);
      notifications.show({
        title: 'Export Failed',
        message: 'Failed to export PDF',
        color: 'red',
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      // If no export data provided, try to extract from table
      let dataToExport = exportData;
      let columnsToUse = exportColumns;

      if (!dataToExport) {
        // Try to extract data from table in the print ref
        const tables = printRef.current?.querySelectorAll('table');
        if (tables && tables.length > 0) {
          dataToExport = [];
          columnsToUse = [];

          const table = tables[0]; // Use first table
          const headers = table.querySelectorAll('thead th');
          headers.forEach((th, index) => {
            columnsToUse.push({
              key: `col${index}`,
              label: th.textContent.trim(),
            });
          });

          const rows = table.querySelectorAll('tbody tr');
          rows.forEach((row) => {
            const rowData = {};
            row.querySelectorAll('td').forEach((td, index) => {
              rowData[`col${index}`] = td.textContent.trim();
            });
            dataToExport.push(rowData);
          });
        }
      }

      if (!dataToExport || dataToExport.length === 0) {
        notifications.show({
          title: 'No Data',
          message: 'No data available to export',
          color: 'yellow',
        });
        return;
      }

      const response = await window.api.print.exportExcel(dataToExport, {
        filename: `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`,
        columns: columnsToUse,
        title: title,
        titleUrdu: titleUrdu,
        dateRange: dateRange,
      });

      if (response.success) {
        notifications.show({
          title: 'Export Successful',
          message: `Excel file saved to: ${response.data.filePath}`,
          color: 'green',
        });
      } else {
        if (response.error !== 'Export cancelled') {
          notifications.show({
            title: 'Export Failed',
            message: response.error,
            color: 'red',
          });
        }
      }
    } catch (error) {
      console.error('Excel export error:', error);
      notifications.show({
        title: 'Export Failed',
        message: 'Failed to export Excel file',
        color: 'red',
      });
    }
  };

  const formatDateDisplay = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Screen Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <div className="text-center">
              <Title order={3} c="dark">
                AL-SHEIKH FISH TRADER
              </Title>
              <Text size="lg" fw={600} className="font-urdu" style={{ direction: 'rtl' }}>
                الشیخ فش ٹریڈر
              </Text>
              <Text size="sm" c="dimmed">
                Fish Market, Karachi | Ph: 0300-1234567
              </Text>
            </div>
            <Divider my="xs" />
            <Group gap="xs" justify="center">
              <Title order={4}>{title}</Title>
              {titleUrdu && (
                <Text size="lg" fw={600} style={{ direction: 'rtl' }}>
                  {titleUrdu}
                </Text>
              )}
            </Group>
            {dateRange && (
              <Text size="sm" c="dimmed" ta="center">
                From: {formatDateDisplay(dateRange.from)} To: {formatDateDisplay(dateRange.to)}
              </Text>
            )}
            {singleDate && (
              <Text size="sm" c="dimmed" ta="center">
                Date: {formatDateDisplay(singleDate)}
              </Text>
            )}
          </Stack>
          <Group gap="xs">
            <Button.Group>
              <Button variant="default" size="xs" onClick={handleZoomOut} title="Zoom Out">
                <IconZoomOut size={16} />
              </Button>
              <Button variant="default" size="xs" style={{ pointerEvents: 'none', minWidth: 50 }}>
                {zoom}%
              </Button>
              <Button variant="default" size="xs" onClick={handleZoomIn} title="Zoom In">
                <IconZoomIn size={16} />
              </Button>
              <Button variant="default" size="xs" onClick={handleZoomReset} title="Reset Zoom">
                <IconZoomReset size={16} />
              </Button>
            </Button.Group>
            <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint} variant="light">
              Print
            </Button>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button variant="light" rightSection={<IconChevronDown size={14} />}>
                  Export
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconFileTypePdf size={16} />} onClick={handleExportPDF}>
                  Export to PDF
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileSpreadsheet size={16} />}
                  onClick={handleExportExcel}
                >
                  Export to Excel (.xlsx)
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        <Divider />

        {/* Report Content (printable area) */}
        <div style={{ overflow: 'auto' }}>
          <div
            ref={printRef}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: zoom !== 100 ? `${10000 / zoom}%` : '100%',
              transition: 'transform 0.15s ease',
            }}
          >
            {children}
          </div>
        </div>
      </Stack>
    </Paper>
  );
}


ReportViewer.propTypes = {
  title: PropTypes.string.isRequired,
  titleUrdu: PropTypes.string,
  dateRange: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
  }),
  singleDate: PropTypes.string,
  children: PropTypes.node,
  exportData: PropTypes.array,
  exportColumns: PropTypes.array,
};

export default ReportViewer;
