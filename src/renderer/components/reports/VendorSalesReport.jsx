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
 * Vendor Sales Report (8.10) - بیوپاری بکری
 * Shows sales grouped by supplier/vendor with customer, vehicle, item details
 */
export function VendorSalesReport() {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [allVendors, setAllVendors] = useState(true);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [reportData, setReportData] = useState(null);

  // Fetch suppliers for dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await window.api.suppliers.getAll();
        if (response.success) {
          setSuppliers(
            response.data.map((s) => ({
              value: String(s.id),
              label: s.name + (s.name_english ? ` (${s.name_english})` : ''),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
    fetchSuppliers();
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

  const formatWeight = (num) => {
    return (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!allVendors && !selectedSupplier) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select a vendor or check "All Vendors"',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.reports.getVendorSales({
        supplierId: selectedSupplier ? parseInt(selectedSupplier) : null,
        dateFrom: formatDate(dateFrom),
        dateTo: formatDate(dateTo),
        allVendors,
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
  }, [selectedSupplier, dateFrom, dateTo, allVendors]);

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
            label="Vendor"
            placeholder="Select vendor"
            data={suppliers}
            value={selectedSupplier}
            onChange={setSelectedSupplier}
            searchable
            clearable
            disabled={allVendors}
          />
        </Grid.Col>
        <Grid.Col span={1}>
          <Checkbox
            label="All"
            checked={allVendors}
            onChange={(e) => {
              setAllVendors(e.target.checked);
              if (e.target.checked) setSelectedSupplier(null);
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
          title="Vendor Sales Report"
          titleUrdu="بیوپاری بکری"
          dateRange={{ from: formatDate(dateFrom), to: formatDate(dateTo) }}
        >
          <ScrollArea>
            {/* Summary by Vendor */}
            <Text fw={600} mb="sm">
              Summary by Vendor
            </Text>
            <Table striped highlightOnHover withTableBorder withColumnBorders mb="xl">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Vendor Name</Table.Th>
                  <Table.Th className="text-right">Vehicles</Table.Th>
                  <Table.Th className="text-right">Total Weight (kg)</Table.Th>
                  <Table.Th className="text-right">Total Amount</Table.Th>
                  <Table.Th className="text-right">Total Profit</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.summary.map((row, index) => (
                  <Table.Tr key={row.supplier_id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{row.supplier_name}</Table.Td>
                    <Table.Td className="text-right">{row.vehicle_count || 0}</Table.Td>
                    <Table.Td className="text-right">{formatWeight(row.total_weight)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.total_amount)}</Table.Td>
                    <Table.Td className="text-right">
                      {(() => {
                        const vendorTxns = reportData.transactions.filter(
                          (t) => t.supplier_id === row.supplier_id
                        );
                        const profit = vendorTxns.reduce((sum, t) => {
                          if (t.purchase_rate)
                            return sum + (t.rate - t.purchase_rate) * (t.weight || 0);
                          return sum;
                        }, 0);
                        return (
                          <Text c={profit >= 0 ? 'green' : 'red'} size="sm">
                            {formatNumber(profit)}
                          </Text>
                        );
                      })()}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr className="font-bold bg-gray-100">
                  <Table.Td colSpan={2}>
                    <strong>Grand Total</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{reportData.grandTotals?.total_vehicles || 0}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatWeight(reportData.grandTotals?.total_weight)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>{formatNumber(reportData.grandTotals?.total_amount)}</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    {(() => {
                      const totalProfit = reportData.transactions.reduce((sum, t) => {
                        if (t.purchase_rate)
                          return sum + (t.rate - t.purchase_rate) * (t.weight || 0);
                        return sum;
                      }, 0);
                      return (
                        <strong>
                          <Text component="span" c={totalProfit >= 0 ? 'green' : 'red'}>
                            {formatNumber(totalProfit)}
                          </Text>
                        </strong>
                      );
                    })()}
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {/* Detailed Transactions */}
            <Text fw={600} mb="sm">
              Transaction Details
            </Text>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Sale #</Table.Th>
                  <Table.Th>Vendor</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Vehicle #</Table.Th>
                  <Table.Th>Item</Table.Th>
                  <Table.Th className="text-right">Weight</Table.Th>
                  <Table.Th className="text-right">Rate</Table.Th>
                  <Table.Th className="text-right">Amount</Table.Th>
                  <Table.Th className="text-right">Purch. Rate</Table.Th>
                  <Table.Th className="text-right">Profit/kg</Table.Th>
                  <Table.Th className="text-right">Total Profit</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.transactions.map((row, index) => (
                  <Table.Tr key={`${row.sale_id}-${row.item_name}-${index}`}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{new Date(row.sale_date).toLocaleDateString('en-GB')}</Table.Td>
                    <Table.Td>{row.sale_number}</Table.Td>
                    <Table.Td>{row.supplier_name || 'N/A'}</Table.Td>
                    <Table.Td>{row.customer_name}</Table.Td>
                    <Table.Td>{row.vehicle_number || '-'}</Table.Td>
                    <Table.Td>{row.item_name}</Table.Td>
                    <Table.Td className="text-right">{formatWeight(row.weight)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.rate)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.amount)}</Table.Td>
                    <Table.Td className="text-right">
                      {row.purchase_rate ? (
                        formatNumber(row.purchase_rate)
                      ) : (
                        <Text size="xs" c="dimmed">
                          N/A
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td className="text-right">
                      {row.purchase_rate ? (
                        <Text c={row.rate - row.purchase_rate >= 0 ? 'green' : 'red'} size="sm">
                          {formatNumber(row.rate - row.purchase_rate)}
                        </Text>
                      ) : (
                        <Text size="xs" c="dimmed">
                          N/A
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td className="text-right">
                      {row.purchase_rate ? (
                        <Text c={row.rate - row.purchase_rate >= 0 ? 'green' : 'red'} size="sm">
                          {formatNumber((row.rate - row.purchase_rate) * (row.weight || 0))}
                        </Text>
                      ) : (
                        <Text size="xs" c="dimmed">
                          N/A
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
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

export default VendorSalesReport;
