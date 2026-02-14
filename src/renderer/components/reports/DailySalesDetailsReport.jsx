import { useState, useCallback } from 'react';
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
        >
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Sale #</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Supplier</Table.Th>
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
