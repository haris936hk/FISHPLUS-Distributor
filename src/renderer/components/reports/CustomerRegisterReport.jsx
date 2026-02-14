import { useState, useCallback } from 'react';
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
