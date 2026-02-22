import { useState, useCallback, useMemo } from 'react';
import { Stack, Grid, Button, Table, LoadingOverlay, Text, ScrollArea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ReportViewer } from '../ReportViewer';

/**
 * Daily Sales Details Report (امروزہ بکری تفصیلات)
 * Shows detailed line-item sales for a specific date
 */
export function DailySalesDetailsReport() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
      const response = await window.api.reports.getDailyDetails({
        date: formatDate(selectedDate),
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
  }, [selectedDate]);

  // ——— Professional Urdu-only print layout ———
  const printContentHTML = useMemo(() => {
    if (!reportData || reportData.transactions.length === 0) return null;

    const fmt = (num) =>
      (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const rows = reportData.transactions
      .map(
        (row, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: right;">${row.customer_name}</td>
        <td style="text-align: right;">${row.supplier_name || '-'}</td>
        <td style="text-align: right;">${row.item_name}</td>
        <td class="amount-cell" style="text-align: left;">${row.sale_number}</td>
        <td class="amount-cell">${fmt(row.weight)}</td>
        <td class="amount-cell">Rs. ${fmt(row.rate)}</td>
        <td class="amount-cell">Rs. ${fmt(row.amount)}</td>
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
            <th colspan="8" class="section-header">امروزہ بکری تفصیلات / Daily Sales Details Report</th>
          </tr>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: right;">صارف / Customer</th>
            <th style="text-align: right;">وینڈر / Vendor</th>
            <th style="text-align: right;">آئٹم / Item</th>
            <th style="width: 80px; text-align: left; direction: ltr;">بل نمبر / Sale #</th>
            <th style="width: 80px; text-align: left; direction: ltr;">وزن / Weight</th>
            <th style="width: 100px; text-align: left; direction: ltr;">ریٹ / Rate</th>
            <th style="width: 120px; text-align: left; direction: ltr;">رقم / Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="5" style="text-align: left;">Total / کل</td>
            <td class="amount-cell">${fmt(reportData.totals.total_weight)}</td>
            <td class="amount-cell"></td>
            <td class="amount-cell">Rs. ${fmt(reportData.totals.total_amount)}</td>
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
            label="Date"
            value={selectedDate}
            onChange={setSelectedDate}
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
          title="Daily Sales Details"
          titleUrdu="امروزہ بکری تفصیلات"
          singleDate={formatDate(selectedDate)}
          printContentHTML={printContentHTML}
        >
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Sale #</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Vendor</Table.Th>
                  <Table.Th>Item</Table.Th>
                  <Table.Th className="text-right">Weight</Table.Th>
                  <Table.Th className="text-right">Rate</Table.Th>
                  <Table.Th className="text-right">Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.transactions.map((row, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{row.sale_number}</Table.Td>
                    <Table.Td>{row.customer_name}</Table.Td>
                    <Table.Td>{row.supplier_name || '-'}</Table.Td>
                    <Table.Td>{row.item_name}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.weight)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.rate)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.amount)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr className="font-bold bg-gray-100">
                  <Table.Td colSpan={5}>
                    <strong>Total</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.total_weight)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right"></Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.total_amount)}</strong>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {reportData.transactions.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No sales found for the selected date
              </Text>
            )}
          </ScrollArea>
        </ReportViewer>
      )}
    </Stack>
  );
}

export default DailySalesDetailsReport;
