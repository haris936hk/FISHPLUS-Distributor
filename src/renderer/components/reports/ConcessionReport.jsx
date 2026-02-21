import { useState, useEffect, useCallback } from 'react';
import {
  Stack,
  Grid,
  Select,
  Checkbox,
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
 * Concession Report (رعایت رپورٹ)
 * Shows sales with discounts/concessions
 */
export function ConcessionReport() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [allClients, setAllClients] = useState(true);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [reportData, setReportData] = useState(null);

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await window.api.customers.getAll();
        if (response.success) {
          setCustomers(
            response.data.map((c) => ({
              value: String(c.id),
              label: c.name + (c.name_english ? ` (${c.name_english})` : ''),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
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
    if (!allClients && !selectedCustomer) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select a customer or check "All Customers"',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.reports.getConcession({
        customerId: selectedCustomer ? parseInt(selectedCustomer) : null,
        dateFrom: formatDate(dateFrom),
        dateTo: formatDate(dateTo),
        allClients,
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
  }, [selectedCustomer, dateFrom, dateTo, allClients]);

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
        <Grid.Col span={3}>
          <Select
            label="Customer"
            placeholder="Select client"
            data={customers}
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            searchable
            clearable
            disabled={allClients}
          />
        </Grid.Col>
        <Grid.Col span={1}>
          <Checkbox
            label="All"
            checked={allClients}
            onChange={(e) => {
              setAllClients(e.target.checked);
              if (e.target.checked) setSelectedCustomer(null);
            }}
            mt="xl"
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
          title="Concession Report"
          titleUrdu="رعایت رپورٹ"
          dateRange={{ from: formatDate(dateFrom), to: formatDate(dateTo) }}
        >
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Sale #</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th className="text-right">Concession Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.transactions.map((row, index) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{new Date(row.sale_date).toLocaleDateString()}</Table.Td>
                    <Table.Td>{row.sale_number}</Table.Td>
                    <Table.Td>{row.customer_name}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.concession)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr className="font-bold bg-gray-100">
                  <Table.Td colSpan={4}>
                    <strong>Total Concession</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.totalConcession)}</strong>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {reportData.transactions.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No concessions found for the selected criteria
              </Text>
            )}
          </ScrollArea>
        </ReportViewer>
      )}
    </Stack>
  );
}

export default ConcessionReport;
