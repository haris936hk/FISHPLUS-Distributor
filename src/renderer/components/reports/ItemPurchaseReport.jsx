import { useState, useEffect, useCallback } from 'react';
import {
  Stack,
  Grid,
  Select,
  Button,
  Table,
  LoadingOverlay,
  Text,
  ScrollArea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ReportViewer } from '../ReportViewer';

/**
 * Item Purchase Report (خریداری)
 * Shows purchases for a specific item within date range
 */
export function ItemPurchaseReport() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [reportData, setReportData] = useState(null);

  // Fetch items for dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await window.api.items.getAll();
        if (response.success) {
          setItems(
            response.data.map((i) => ({
              value: String(i.id),
              label: i.name + (i.name_english ? ` (${i.name_english})` : ''),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

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
    if (!selectedItem) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select an item',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.reports.getItemPurchases({
        itemId: parseInt(selectedItem),
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
  }, [selectedItem, dateFrom, dateTo]);

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={loading} />

      {/* Filters */}
      <Grid align="flex-end">
        <Grid.Col span={3}>
          <DatePickerInput
            label="From Date"
            value={dateFrom}
            onChange={setDateFrom}
            maxDate={dateTo}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <DatePickerInput
            label="To Date"
            value={dateTo}
            onChange={setDateTo}
            minDate={dateFrom}
            maxDate={new Date()}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="Item"
            placeholder="Select item"
            data={items}
            value={selectedItem}
            onChange={setSelectedItem}
            searchable
            clearable
            required
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Button leftSection={<IconSearch size={16} />} onClick={handleGenerate} fullWidth>
            Go
          </Button>
        </Grid.Col>
      </Grid>

      {/* Report Display */}
      {reportData && (
        <ReportViewer
          title="Item Purchase Report"
          titleUrdu="خریداری"
          dateRange={{ from: formatDate(dateFrom), to: formatDate(dateTo) }}
        >
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Purchase #</Table.Th>
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
                    <Table.Td>{new Date(row.purchase_date).toLocaleDateString()}</Table.Td>
                    <Table.Td>{row.purchase_number}</Table.Td>
                    <Table.Td>{row.supplier_name}</Table.Td>
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
                    <strong>{formatNumber(reportData.summary.total_weight)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>Avg: {formatNumber(reportData.summary.avg_rate)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.summary.total_amount)}</strong>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {reportData.transactions.length === 0 && (
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

export default ItemPurchaseReport;
