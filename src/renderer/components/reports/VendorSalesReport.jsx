import { useState, useEffect, useCallback, useMemo } from 'react';
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
 * Shows sales grouped by supplier/vendor with customer, vehicle, item details.
 * Matches the original system layout: transactions grouped by vendor with subtotals.
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

  // Group transactions by vendor for display
  const groupedByVendor = useMemo(() => {
    return reportData
      ? reportData.transactions.reduce((groups, txn) => {
          const key = txn.supplier_id || 0;
          if (!groups[key]) {
            groups[key] = {
              supplierName: txn.supplier_name || 'Unknown',
              transactions: [],
              totalWeight: 0,
              totalAmount: 0,
              vehicleNumbers: new Set(),
            };
          }
          groups[key].transactions.push(txn);
          groups[key].totalWeight += txn.weight || 0;
          groups[key].totalAmount += txn.amount || 0;
          if (txn.vehicle_number) groups[key].vehicleNumbers.add(txn.vehicle_number);
          return groups;
        }, {})
      : {};
  }, [reportData]);

  // Grand totals
  const grandTotalWeight = reportData
    ? reportData.transactions.reduce((sum, t) => sum + (t.weight || 0), 0)
    : 0;
  const grandTotalAmount = reportData
    ? reportData.transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    : 0;
  const grandTotalVehicles = Object.values(groupedByVendor).reduce(
    (sum, g) => sum + g.vehicleNumbers.size,
    0
  );

  // ——— Professional Urdu-only print layout ———
  const printContentHTML = useMemo(() => {
    if (!reportData || reportData.transactions.length === 0) return null;

    const fmt = (num) =>
      (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const fmtWeight = (num) =>
      (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });

    let layoutHtml = '';

    Object.values(groupedByVendor).forEach((group) => {
      layoutHtml += `
        <tr style="background-color: #f0f0f0; font-weight: bold;">
          <td colspan="5" style="text-align: right; font-size: 14px;">بیوپاری: ${group.supplierName}</td>
          <td colspan="2" style="text-align: left; font-size: 12px; direction: ltr;">Total Vehicles: ${group.vehicleNumbers.size}</td>
        </tr>
      `;

      let lineNumber = 0;
      group.transactions.forEach((row) => {
        lineNumber++;
        layoutHtml += `
          <tr>
            <td style="text-align: center;">${lineNumber}</td>
            <td style="text-align: right;">${row.customer_name}</td>
            <td style="text-align: right;">${row.item_name}</td>
            <td style="text-align: right;">${row.vehicle_number || '-'}</td>
            <td class="amount-cell">Rs. ${fmt(row.rate)}</td>
            <td class="amount-cell">${fmtWeight(row.weight)}</td>
            <td class="amount-cell">Rs. ${fmt(row.amount)}</td>
          </tr>
        `;
      });

      layoutHtml += `
        <tr style="background-color: #e8e8e8; font-weight: bold; border-bottom: 2px solid #000;">
          <td colspan="5" style="text-align: left;">ٹوٹل / Vendor Total:</td>
          <td class="amount-cell">${fmtWeight(group.totalWeight)}</td>
          <td class="amount-cell">Rs. ${fmt(group.totalAmount)}</td>
        </tr>
      `;
    });

    return `
      <style>
        .print-table { width: 100%; border-collapse: collapse; margin: 14px 0; direction: rtl; }
        .print-table th, .print-table td { border: 1px solid #000; padding: 8px 14px; font-size: 14px; text-align: right; }
        .print-table th { background-color: #e8e8e8; font-weight: bold; font-size: 13px; }
        .print-table .section-header { background-color: #f5f5f5; font-weight: bold; font-size: 14px; text-align: center; }
        .print-table .amount-cell { text-align: left; direction: ltr; font-family: 'Segoe UI', Tahoma, sans-serif; white-space: nowrap; }
        .print-table .grand-total-row { background-color: #d0e0f0; font-weight: bold; font-size: 16px; border-top: 2px solid #000; }
      </style>

      <table class="print-table">
        <thead>
          <tr>
            <th colspan="7" class="section-header">بیوپاری بکری / Vendor Sales Report</th>
          </tr>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: right;">گاہک / Customer</th>
            <th style="text-align: right;">قسم / Item</th>
            <th style="text-align: right;">گاڑی نمبر / Vehicle #</th>
            <th style="width: 100px; text-align: left; direction: ltr;">ریٹ / Rate</th>
            <th style="width: 100px; text-align: left; direction: ltr;">وزن / Weight</th>
            <th style="width: 120px; text-align: left; direction: ltr;">رقم / Amount</th>
          </tr>
        </thead>
        <tbody>
          ${layoutHtml}
          <tr class="grand-total-row">
            <td colspan="3" style="text-align: left;">Grand Total / مکمل ٹوٹل</td>
            <td style="text-align: right;">Vehicles: ${grandTotalVehicles}</td>
            <td></td>
            <td class="amount-cell">${fmtWeight(grandTotalWeight)}</td>
            <td class="amount-cell">Rs. ${fmt(grandTotalAmount)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }, [reportData, groupedByVendor, grandTotalVehicles, grandTotalWeight, grandTotalAmount]);

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={loading} />

      {/* Filters */}
      <Grid align="flex-end">
        <Grid.Col span={3}>
          <Select
            label="بیوپاری (Vendor)"
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
        <Grid.Col span={3}>
          <DatePickerInput
            label="Sale Date From"
            value={dateFrom}
            onChange={setDateFrom}
            maxDate={dateTo}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <DatePickerInput
            label="Sale Date To"
            value={dateTo}
            onChange={setDateTo}
            minDate={dateFrom}
            maxDate={new Date()}
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
          printContentHTML={printContentHTML}
        >
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ textAlign: 'center' }}>
                    نمبر
                    <br />#
                  </Table.Th>
                  <Table.Th>
                    گاہک
                    <br />
                    Customer
                  </Table.Th>
                  <Table.Th>
                    قسم
                    <br />
                    Item
                  </Table.Th>
                  <Table.Th>
                    گاڑی نمبر
                    <br />
                    Vehicle #
                  </Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>
                    ریٹ (kg)
                    <br />
                    Rate
                  </Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>
                    وزن (kg)
                    <br />
                    Weight
                  </Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>
                    رقم
                    <br />
                    Amount
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Object.entries(groupedByVendor).map(([supplierId, group]) => {
                  let lineNumber = 0;
                  return [
                    // Vendor header row
                    <Table.Tr key={`header-${supplierId}`} style={{ backgroundColor: '#f0f0f0' }}>
                      <Table.Td colSpan={4}>
                        <Text fw={700}>بیوپاری: {group.supplierName}</Text>
                      </Table.Td>
                      <Table.Td colSpan={3} style={{ textAlign: 'right' }}>
                        <Text size="sm">ٹوٹل گاڑیاں: {group.vehicleNumbers.size}</Text>
                      </Table.Td>
                    </Table.Tr>,
                    // Transaction rows
                    ...group.transactions.map((row) => {
                      lineNumber++;
                      return (
                        <Table.Tr key={`${row.sale_id}-${row.item_name}-${lineNumber}`}>
                          <Table.Td style={{ textAlign: 'center' }}>{lineNumber}</Table.Td>
                          <Table.Td>{row.customer_name}</Table.Td>
                          <Table.Td>{row.item_name}</Table.Td>
                          <Table.Td>{row.vehicle_number || '-'}</Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            {formatNumber(row.rate)}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            {formatWeight(row.weight)}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            {formatNumber(row.amount)}
                          </Table.Td>
                        </Table.Tr>
                      );
                    }),
                    // Vendor subtotal row
                    <Table.Tr
                      key={`subtotal-${supplierId}`}
                      style={{ backgroundColor: '#e8e8e8', fontWeight: 'bold' }}
                    >
                      <Table.Td colSpan={5} style={{ textAlign: 'right' }}>
                        <strong>ٹوٹل (Total)</strong>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <strong>{formatWeight(group.totalWeight)}</strong>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <strong>{formatNumber(group.totalAmount)}</strong>
                      </Table.Td>
                    </Table.Tr>,
                  ];
                })}
              </Table.Tbody>
              {/* Grand Total Footer */}
              <Table.Tfoot>
                <Table.Tr className="font-bold" style={{ backgroundColor: '#d0e0f0' }}>
                  <Table.Td colSpan={3}>
                    <strong>Grand Total</strong>
                  </Table.Td>
                  <Table.Td>
                    <strong>Vehicles: {grandTotalVehicles}</strong>
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <strong>{formatWeight(grandTotalWeight)}</strong>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <strong>{formatNumber(grandTotalAmount)}</strong>
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

export default VendorSalesReport;
