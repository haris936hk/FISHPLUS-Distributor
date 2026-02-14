import { useState, useCallback } from 'react';
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
