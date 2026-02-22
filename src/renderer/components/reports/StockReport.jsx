import { useState, useCallback, useMemo } from 'react';
import { Stack, Grid, Button, Table, LoadingOverlay, Text, ScrollArea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ReportViewer } from '../ReportViewer';

/**
 * Stock Report (سٹاک رپورٹ)
 * Shows stock levels for all items as of a specific date
 */
export function StockReport() {
  const [loading, setLoading] = useState(false);
  const [asOfDate, setAsOfDate] = useState(new Date());
  const [reportData, setReportData] = useState(null);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatNumber = (num) => {
    return (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const response = await window.api.reports.getStock({
        asOfDate: formatDate(asOfDate),
      });

      if (response.success) {
        setReportData(response.data);
      } else {
        notifications.show({
          title: 'Error',
          message: response.error || 'Failed to generate report',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to generate report',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [asOfDate]);

  // ——— Professional Urdu-only print layout ———
  const printContentHTML = useMemo(() => {
    if (!reportData || reportData.items.length === 0) return null;

    const fmt = (num) =>
      (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const rows = reportData.items
      .map(
        (item, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: right;">${item.item_name}</td>
        <td class="amount-cell">${fmt(item.previous_stock)}</td>
        <td class="amount-cell">${fmt(item.today_purchases)}</td>
        <td class="amount-cell">${fmt(item.today_sales)}</td>
        <td class="amount-cell" style="color: ${item.remaining_stock < 0 ? 'red' : 'black'}; font-weight: ${item.remaining_stock < 0 ? 'bold' : 'normal'};">
          ${fmt(item.remaining_stock)}
        </td>
      </tr>
    `
      )
      .join('');

    return `
      <style>
        .print-table { width: 100%; border-collapse: collapse; margin: 14px 0; direction: rtl; }
        .print-table th, .print-table td { border: 1px solid #000; padding: 8px 14px; font-size: 14px; text-align: right; }
        .print-table th { background-color: #e8e8e8; font-weight: bold; font-size: 13px; }
        .print-table .section-header { background-color: #f5f5f5; font-weight: bold; font-size: 14px; text-align: center; }
        .print-table .amount-cell { text-align: left; direction: ltr; font-family: 'Segoe UI', Tahoma, sans-serif; white-space: nowrap; }
        .print-table .total-row { background-color: #f0f0f0; font-weight: bold; font-size: 15px; }
      </style>

      <table class="print-table">
        <thead>
          <tr>
            <th colspan="6" class="section-header">سٹاک رپورٹ / Stock Report</th>
          </tr>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: right;">آئٹم / Item Name</th>
            <th style="width: 120px; text-align: left; direction: ltr;">سابقہ سٹاک / Previous Stock</th>
            <th style="width: 120px; text-align: left; direction: ltr;">آج کی خریداری / Today Pur.</th>
            <th style="width: 120px; text-align: left; direction: ltr;">آج کی بکری / Today Sale</th>
            <th style="width: 120px; text-align: left; direction: ltr;">بقیہ سٹاک / Rem. Stock</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="2" style="text-align: left;">Total / کل</td>
            <td class="amount-cell">${fmt(reportData.totals.previous_stock)}</td>
            <td class="amount-cell">${fmt(reportData.totals.today_purchases)}</td>
            <td class="amount-cell">${fmt(reportData.totals.today_sales)}</td>
            <td class="amount-cell">${fmt(reportData.totals.remaining_stock)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }, [reportData]);

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={loading} />

      {/* Filters */}
      <Grid align="flex-end">
        <Grid.Col span={6}>
          <DatePickerInput
            label="As of Date"
            value={asOfDate}
            onChange={setAsOfDate}
            maxDate={new Date()}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Button leftSection={<IconSearch size={16} />} onClick={handleGenerate} fullWidth>
            Go
          </Button>
        </Grid.Col>
      </Grid>

      {/* Report Display */}
      {reportData && (
        <ReportViewer
          title="Stock Report"
          titleUrdu="سٹاک رپورٹ"
          singleDate={formatDate(asOfDate)}
          printContentHTML={printContentHTML}
        >
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Item Name</Table.Th>
                  <Table.Th className="text-right">Previous Stock</Table.Th>
                  <Table.Th className="text-right">Today Purchase</Table.Th>
                  <Table.Th className="text-right">Today Sale</Table.Th>
                  <Table.Th className="text-right">Remaining Stock</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.items.map((item, index) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{item.item_name}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(item.previous_stock)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(item.today_purchases)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(item.today_sales)}</Table.Td>
                    <Table.Td
                      className="text-right"
                      style={{
                        color: item.remaining_stock < 0 ? 'red' : 'inherit',
                        fontWeight: item.remaining_stock < 0 ? 'bold' : 'normal',
                      }}
                    >
                      {formatNumber(item.remaining_stock)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr className="font-bold bg-gray-100">
                  <Table.Td colSpan={2}>
                    <strong>Total</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.previous_stock)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.today_purchases)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.today_sales)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.remaining_stock)}</strong>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {reportData.items.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No items found
              </Text>
            )}
          </ScrollArea>
        </ReportViewer>
      )}
    </Stack>
  );
}

export default StockReport;
