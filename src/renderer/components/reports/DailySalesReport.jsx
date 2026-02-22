import { useState, useCallback, useMemo } from 'react';
import {
  Stack,
  Grid,
  Button,
  Table,
  LoadingOverlay,
  Text,
  ScrollArea,
  Group,
  Paper,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ReportViewer } from '../ReportViewer';

/**
 * Daily Sales Report (امروزہ بکری)
 * Shows aggregated daily sales summary by item type
 */
export function DailySalesReport() {
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
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
      const response = await window.api.reports.getDailySales({
        dateFrom: formatDate(dateFrom),
        dateTo: formatDate(dateTo),
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
  }, [dateFrom, dateTo]);

  // ——— Professional Urdu-only print layout ———
  const printContentHTML = useMemo(() => {
    if (!reportData || reportData.byItem.length === 0) return null;

    const fmt = (num) =>
      (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const rows = reportData.byItem
      .map(
        (row, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: right;">${row.item_name}</td>
        <td class="amount-cell">${fmt(row.total_weight)}</td>
        <td class="amount-cell">Rs. ${fmt(row.total_amount)}</td>
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
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 20px; direction: rtl; }
        .summary-box { border: 1px solid #ccc; padding: 10px; text-align: center; background-color: #fafafa; border-radius: 4px; }
        .summary-label { font-size: 12px; color: #555; margin-bottom: 5px; }
        .summary-value { font-size: 16px; font-weight: bold; direction: ltr; font-family: 'Segoe UI', Tahoma, sans-serif; }
      </style>

      <table class="print-table">
        <thead>
          <tr>
            <th colspan="4" class="section-header">امروزہ بکری / Daily Sales Report</th>
          </tr>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: right;">آئٹم / Item Name</th>
            <th style="width: 120px; text-align: left; direction: ltr;">کل وزن / Total Weight</th>
            <th style="width: 150px; text-align: left; direction: ltr;">کل رقم / Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="summary-grid">
        <div class="summary-box">
          <div class="summary-label">Gross Amount / کل رقم</div>
          <div class="summary-value">Rs. ${fmt(reportData.totals.gross_amount)}</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Charges / اخراجات</div>
          <div class="summary-value">Rs. ${fmt(reportData.totals.total_charges)}</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Net Amount / خالص رقم</div>
          <div class="summary-value">Rs. ${fmt(reportData.totals.net_amount)}</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Cash Received / نقد وصولی</div>
          <div class="summary-value">Rs. ${fmt(reportData.totals.cash_received)}</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Collection / کل وصولی</div>
          <div class="summary-value">Rs. ${fmt(reportData.totals.total_collection)}</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Discount / رعایت</div>
          <div class="summary-value">Rs. ${fmt(reportData.totals.total_discount)}</div>
        </div>
        <div class="summary-box" style="grid-column: span 2;">
          <div class="summary-label">Balance / بقایا</div>
          <div class="summary-value" style="color: ${reportData.totals.total_balance > 0 ? 'red' : 'green'};">Rs. ${fmt(reportData.totals.total_balance)}</div>
        </div>
      </div>
    `;
  }, [reportData]);

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={loading} />

      {/* Filters */}
      <Grid align="flex-end">
        <Grid.Col span={4}>
          <DatePickerInput
            label="From Date"
            value={dateFrom}
            onChange={setDateFrom}
            maxDate={dateTo}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <DatePickerInput
            label="To Date"
            value={dateTo}
            onChange={setDateTo}
            minDate={dateFrom}
            maxDate={new Date()}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Button leftSection={<IconSearch size={16} />} onClick={handleGenerate} fullWidth>
            Go
          </Button>
        </Grid.Col>
      </Grid>

      {/* Report Display */}
      {reportData && (
        <ReportViewer
          title="Daily Sales Report"
          titleUrdu="امروزہ بکری"
          dateRange={{ from: formatDate(dateFrom), to: formatDate(dateTo) }}
          printContentHTML={printContentHTML}
        >
          <ScrollArea>
            {/* Sales by Item Type */}
            <Table striped highlightOnHover withTableBorder withColumnBorders mb="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Item Name</Table.Th>
                  <Table.Th className="text-right">Total Weight</Table.Th>
                  <Table.Th className="text-right">Total Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.byItem.map((row, index) => (
                  <Table.Tr key={row.item_id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{row.item_name}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.total_weight)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.total_amount)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {/* Grand Totals Summary */}
            <Paper p="md" withBorder>
              <Text fw={600} mb="sm">
                Summary
              </Text>
              <Group grow>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Gross Amount
                  </Text>
                  <Text fw={600}>{formatNumber(reportData.totals.gross_amount)}</Text>
                </Stack>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Charges
                  </Text>
                  <Text fw={600}>{formatNumber(reportData.totals.total_charges)}</Text>
                </Stack>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Net Amount
                  </Text>
                  <Text fw={600}>{formatNumber(reportData.totals.net_amount)}</Text>
                </Stack>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Cash Received
                  </Text>
                  <Text fw={600}>{formatNumber(reportData.totals.cash_received)}</Text>
                </Stack>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Collection
                  </Text>
                  <Text fw={600}>{formatNumber(reportData.totals.total_collection)}</Text>
                </Stack>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Discount
                  </Text>
                  <Text fw={600}>{formatNumber(reportData.totals.total_discount)}</Text>
                </Stack>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Balance
                  </Text>
                  <Text fw={600} c={reportData.totals.total_balance > 0 ? 'red' : 'green'}>
                    {formatNumber(reportData.totals.total_balance)}
                  </Text>
                </Stack>
              </Group>
            </Paper>

            {reportData.byItem.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No records found for the selected criteria
              </Text>
            )}
          </ScrollArea>
        </ReportViewer>
      )}
    </Stack>
  );
}

export default DailySalesReport;
