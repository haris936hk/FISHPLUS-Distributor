import { useState, useCallback, useMemo } from 'react';
import { Stack, Grid, Button, Table, LoadingOverlay, Text, ScrollArea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ReportViewer } from '../ReportViewer';

/**
 * Customer Register Report (رجسٹر کھاتہ رقم)
 * Shows account balances for all customers as of a specific date
 */
export function CustomerRegisterReport() {
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
      const response = await window.api.reports.getCustomerRegister({
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
    if (!reportData || reportData.customers.length === 0) return null;

    const fmt = (num) =>
      (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const rows = reportData.customers
      .map(
        (cust, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: right;">${cust.customer_name}</td>
        <td class="amount-cell" style="text-align: left;">${cust.code}</td>
        <td class="amount-cell">Rs. ${fmt(cust.opening_balance)}</td>
        <td class="amount-cell">Rs. ${fmt(cust.net_amount)}</td>
        <td class="amount-cell">Rs. ${fmt(cust.collection)}</td>
        <td class="amount-cell" style="color: ${cust.balance > 0 ? 'red' : cust.balance < 0 ? 'green' : 'black'}; font-weight: bold;">
          Rs. ${fmt(cust.balance)}
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
            <th colspan="7" class="section-header">رجسٹر کھاتہ رقم / Customer Register Report</th>
          </tr>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: right;">صارف / Customer</th>
            <th style="width: 80px; text-align: left; direction: ltr;">کوڈ / Code</th>
            <th style="width: 120px; text-align: left; direction: ltr;">سابقہ بقایا / Opening Bal</th>
            <th style="width: 120px; text-align: left; direction: ltr;">کل رقم / Net Amount</th>
            <th style="width: 120px; text-align: left; direction: ltr;">وصولی / Collection</th>
            <th style="width: 120px; text-align: left; direction: ltr;">بقایا / Balance</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="3" style="text-align: left;">Total / کل</td>
            <td class="amount-cell">Rs. ${fmt(reportData.totals.previous)}</td>
            <td class="amount-cell">Rs. ${fmt(reportData.totals.net_amount)}</td>
            <td class="amount-cell">Rs. ${fmt(reportData.totals.collection)}</td>
            <td class="amount-cell">Rs. ${fmt(reportData.totals.balance)}</td>
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
          title="Customer Register"
          titleUrdu="رجسٹر کھاتہ رقم"
          singleDate={formatDate(asOfDate)}
          printContentHTML={printContentHTML}
        >
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Customer Name</Table.Th>
                  <Table.Th className="text-right">Opening Balance</Table.Th>
                  <Table.Th className="text-right">Net Amount</Table.Th>
                  <Table.Th className="text-right">Collection</Table.Th>
                  <Table.Th className="text-right">Balance</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.customers.map((cust, index) => (
                  <Table.Tr key={cust.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{cust.code}</Table.Td>
                    <Table.Td>{cust.customer_name}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(cust.opening_balance)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(cust.net_amount)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(cust.collection)}</Table.Td>
                    <Table.Td
                      className="text-right"
                      style={{
                        color: cust.balance > 0 ? 'red' : 'green',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatNumber(cust.balance)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr className="font-bold bg-gray-100">
                  <Table.Td colSpan={3}>
                    <strong>Total</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.previous)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.net_amount)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.collection)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totals.balance)}</strong>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {reportData.customers.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No customers found
              </Text>
            )}
          </ScrollArea>
        </ReportViewer>
      )}
    </Stack>
  );
}

export default CustomerRegisterReport;
